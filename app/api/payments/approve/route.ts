import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentId } = body;

    // 1. Validacija
    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      console.error("🔥 CRITICAL: Fali PI_API_KEY u .env fajlu!");
      return NextResponse.json({ error: "Server config error: Missing API Key" }, { status: 500 });
    }

    // 2. Poziv ka Pi Serveru (Mora da se desi brzo!)
    console.log(`⏳ APPROVE: Šaljem zahtev za ${paymentId}`);
    
    const piResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}) // Prazno telo
    });

    // 3. Ako Pi odbije, odmah javljamo frontendu (da prekine vrtenje)
    if (!piResponse.ok) {
      const errorText = await piResponse.text();
      console.error(`❌ Pi Odbio (${piResponse.status}):`, errorText);
      return NextResponse.json({ error: "Pi API rejected", details: errorText }, { status: piResponse.status });
    }

    // 4. Uspeh
    const data = await piResponse.json();
    console.log("✅ APPROVE: Uspešno.");
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("🔥 Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
