import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log("🛠️ INCOMPLETE ROUTE STARTED");
  
  try {
    // 1. Provera API ključa
    const API_KEY = process.env.PI_API_KEY;
    if (!API_KEY) {
        console.error("❌ GREŠKA: PI_API_KEY nedostaje u Vercelu!");
        return NextResponse.json({ error: "Server config error: Missing API Key" }, { status: 500 });
    }

    // 2. Parsiranje tela zahteva
    const body = await req.json();
    const paymentId = body.paymentId;

    if (!paymentId) {
      console.error("❌ GREŠKA: Nema paymentId u zahtevu");
      return NextResponse.json({ error: 'Nema ID-a transakcije.' }, { status: 400 });
    }

    console.log(`🧹 Pokušavam brisanje za ID: ${paymentId}`);

    // 3. Pokušaj CANCEL direktno (najbrži način)
    const cancelRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}) // Prazan objekat je obavezan
    });

    console.log(`Pi Server Status: ${cancelRes.status}`);

    // Čak i ako Pi vrati 400 ili 404 (jer je već otkazano), mi vraćamo uspeh frontendu
    // da bi prestao da vrti u krug.
    return NextResponse.json({ status: 'fixed', message: 'Cleanup attempted' });

  } catch (error: any) {
    console.error("🔥 CRITICAL SERVER ERROR:", error);
    // Vraćamo JSON čak i kad pukne, da alert ne bi bio "communication error"
    return NextResponse.json({ 
        status: 'error', 
        message: error.message 
    }, { status: 200 }); // Vraćamo 200 da frontend ne poludi
  }
}
