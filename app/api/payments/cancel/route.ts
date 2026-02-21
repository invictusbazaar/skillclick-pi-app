import { NextResponse } from "next/server";
import axios from "axios";

// Tvoj ključ koji provereno radi
const PI_API_KEY = "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp";

export async function POST(req: Request) {
  try {
    const { paymentId, txid } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ error: "Nedostaje paymentId" }, { status: 400 });
    }

    if (txid) {
      // 1. Ako postoji txid, novac je prošao kroz blokčejn -> MORAMO KOMPLETIRATI
      await axios.post(
        `https://api.minepi.com/v2/payments/${paymentId}/complete`,
        { txid: txid },
        { headers: { Authorization: `Key ${PI_API_KEY}` } }
      );
      return NextResponse.json({ success: true, message: "Transakcija je uspešno KOMPLETIRANA na Pi serveru" });
      
    } else {
      // 2. Ako nema txid, korisnik nije platio -> SMEMO OTKAZATI
      await axios.post(
        `https://api.minepi.com/v2/payments/${paymentId}/cancel`,
        {},
        { headers: { Authorization: `Key ${PI_API_KEY}` } }
      );
      return NextResponse.json({ success: true, message: "Transakcija je uspešno OTKAZANA na Pi serveru" });
    }

  } catch (error: any) {
    const piError = error.response?.data?.error?.message || error.message;
    console.error("Greška sa Pi API-ja:", piError);
    return NextResponse.json({ error: piError }, { status: 500 });
  }
}
