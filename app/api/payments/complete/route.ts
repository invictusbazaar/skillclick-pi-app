import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { paymentId, txid } = await request.json();

    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${process.env.PI_API_KEY}`,
      },
      body: JSON.stringify({ txid }),
    });

    if (!response.ok) throw new Error('Pi API Error');

    // Ovde tvoja baza (DATABASE_URL) beleži uspeh
    return NextResponse.json({ message: "Kompletirano" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Greška" }, { status: 500 });
  }
}