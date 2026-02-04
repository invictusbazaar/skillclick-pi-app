import { NextResponse } from 'next/server';

// Tvoj API Key je već ovde, to je dobro.
const PI_API_KEY = "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentId } = body;

    console.log("⏳ APPROVE: Zahtev stigao za Payment ID:", paymentId);

    if (!paymentId) {
        return NextResponse.json({ error: "Nema paymentId" }, { status: 400 });
    }

    // Poziv ka Pi Network serverima da ODOBRIMO transakciju
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}) // Prazno telo je obavezno
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Pi Network je odbio zahtev:", errorText);
        return NextResponse.json({ error: `Pi Greška: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    console.log("✅ Uplata uspešno ODOBRENA! Čekam korisnika da plati...");
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("🔥 Fatalna greška na serveru:", error);
    return NextResponse.json({ error: error.message || "Greška na serveru" }, { status: 500 });
  }
}