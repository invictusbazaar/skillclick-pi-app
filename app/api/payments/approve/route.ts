import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json();

    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
      },
    });

    if (!response.ok) throw new Error('Pi API Error');

    return NextResponse.json({ message: "Odobreno" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Greška" }, { status: 500 });
  }
}