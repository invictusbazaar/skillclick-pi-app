import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentId } = body;

    // 1. Validacija ulaznih podataka
    if (!paymentId) {
      console.error("❌ APPROVE: Nema paymentId u zahtevu.");
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    // 2. Provera Environment varijable
    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      console.error("🔥 CRITICAL: Fali PI_API_KEY u .env fajlu!");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    console.log(`⏳ APPROVE: Šaljem zahtev ka Pi za ID: ${paymentId}`);

    // 3. Poziv ka Pi Network API
    const piResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}) // Prazno telo je obavezno po dokumentaciji
    });

    // 4. Provera odgovora od Pi servera
    if (!piResponse.ok) {
      const errorText = await piResponse.text();
      console.error(`❌ Pi API Odbio (${piResponse.status}):`, errorText);
      return NextResponse.json({ error: "Pi API rejected approval", details: errorText }, { status: piResponse.status });
    }

    // 5. Uspeh
    const data = await piResponse.json();
    console.log("✅ APPROVE: Uspešno odobreno na Pi serveru.");
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("🔥 Fatalna serverska greška (Approve):", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
