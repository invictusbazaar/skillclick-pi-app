import { NextResponse } from "next/server";
import axios from "axios";

// Tvoj ključ iz route.ts koji provereno radi
const PI_API_KEY = "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp";

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ error: "Nedostaje paymentId" }, { status: 400 });
    }

    // Šaljemo komandu Pi serveru sa tvojim direktnim ključem
    await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Key ${PI_API_KEY}`,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const piError = error.response?.data?.error?.message || error.message;
    console.error("Greška sa Pi API-ja:", piError);
    return NextResponse.json({ error: piError }, { status: 500 });
  }
}
