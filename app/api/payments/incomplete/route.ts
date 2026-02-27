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

    let piResponse;

    if (txid) {
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
            body: JSON.stringify({}) // VEOMA BITNO: Pi API zahteva prazan body za POST
        });
    }

    const data = await piResponse.json();

    if (!piResponse.ok) {
        console.error("❌ Pi Server je odbio zahtev za čišćenje:", data);
        return NextResponse.json({ error: `Pi API greška: ${data.message || 'Nepoznato'}` }, { status: 400 });
    }

    console.log(`✅ Zaglavljena transakcija ${paymentId} je uspešno rešena na Pi serveru.`);
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("❌ Greška pri čišćenju zaglavljene transakcije:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
