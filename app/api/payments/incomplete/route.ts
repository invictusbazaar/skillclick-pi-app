import { NextResponse } from 'next/server';

const API_KEY = process.env.PI_API_KEY || "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp";

export async function POST(req: Request) {
  try {
    const { payment } = await req.json();
    const paymentId = payment?.identifier;
    const txid = payment?.transaction?.txid;

    if (!paymentId) {
      return NextResponse.json({ error: 'Nema ID-a transakcije.' }, { status: 400 });
    }

    console.log(`🧹 CISTIM ZAGLAVLJENU TRANSAKCIJU: ${paymentId} | TXID: ${txid || 'NEMA'}`);

    let piResponse;

    if (txid) {
        // Pošto su novčići već prošli, MORAMO da forsiramo /complete da bi Pi server pustio blokadu
        piResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: { 
                'Authorization': `Key ${API_KEY}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ txid })
        });
    } else {
        piResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {
            method: 'POST',
            headers: { 
                'Authorization': `Key ${API_KEY}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({}) 
        });
    }

    const data = await piResponse.json();
    console.log("📡 Odgovor sa Pi Servera:", data);

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("❌ Fatalna greška u incomplete ruti:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
