// app/api/payments/cancel/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ error: "Nedostaje paymentId" }, { status: 400 });
    }

    // Šaljemo komandu Pi serveru da otkaže zaglavljeno plaćanje
    await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
        },
      }
    );

    console.log(`Zaglavljena transakcija ${paymentId} je uspešno otkazana.`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Greška pri otkazivanju zaglavljene transakcije:", error.response?.data || error.message);
    return NextResponse.json({ error: "Greška pri komunikaciji sa Pi API" }, { status: 500 });
  }
}