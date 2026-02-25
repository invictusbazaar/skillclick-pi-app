import { NextResponse } from 'next/server';

const API_KEY = process.env.PI_API_KEY || "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payment } = body;

    const paymentId = payment?.identifier;
    const txid = payment?.transaction?.txid;

    if (!paymentId) {
      return NextResponse.json({ error: 'Nema ID-a transakcije.' }, { status: 400 });
    }

    if (txid) {
        await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: { 
                'Authorization': `Key ${API_KEY}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ txid })
        });
        console.log(`✅ Zaglavljena transakcija ${paymentId} je KOMPLETIRANA i očišćena.`);
    } else {
        await fetch(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {
            method: 'POST',
            headers: { 
                'Authorization': `Key ${API_KEY}`,
                'Content-Type': 'application/json' 
            }
        });
        console.log(`✅ Zaglavljena transakcija ${paymentId} je OTKAZANA i očišćena.`);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("❌ Greška pri čišćenju zaglavljene transakcije:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}