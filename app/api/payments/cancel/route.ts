import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ error: "Nedostaje paymentId" }, { status: 400 });
    }

    if (!process.env.PI_API_KEY) {
      return NextResponse.json({ error: "Nije podešen PI_API_KEY na serveru!" }, { status: 500 });
    }

    // Šaljemo komandu Pi serveru
    await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Ovde hvatamo tačan razlog zašto Pi Network odbija brisanje
    const piError = error.response?.data?.error?.message || error.message;
    console.error("Greška sa Pi API-ja:", piError);
    return NextResponse.json({ error: piError }, { status: 500 });
  }
}
