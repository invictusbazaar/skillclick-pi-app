import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const API_KEY = process.env.PI_API_KEY;
    if (!API_KEY) {
        return NextResponse.json({ error: "Fali PI_API_KEY na serveru!" }, { status: 500 });
    }

    const body = await req.json();
    const paymentId = body.paymentId;

    if (!paymentId) {
      return NextResponse.json({ error: 'Nisam dobio Payment ID od frontenda.' }, { status: 400 });
    }

    console.log(`🛠️ POKUŠAJ 1: CANCEL za ${paymentId}`);
    
    // 1. Prvo probamo CANCEL
    const cancelRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Key ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    if (cancelRes.ok) {
        return NextResponse.json({ status: 'fixed', method: 'cancel', message: 'Uspešno otkazano!' });
    }

    // 2. Ako Cancel ne uspe (npr. greška 400), možda je transakcija već odobrena? Probamo COMPLETE.
    console.log(`🛠️ POKUŠAJ 2: COMPLETE za ${paymentId}`);
    
    const completeRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Key ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ txid: '' }) // Prazan txid da forsiramo zatvaranje
    });

    if (completeRes.ok) {
        return NextResponse.json({ status: 'fixed', method: 'complete', message: 'Uspešno kompletirano (na silu)!' });
    }

    // Ako ništa ne uspe, vraćamo šta je server rekao
    const errText = await cancelRes.text();
    return NextResponse.json({ status: 'error', message: `Pi Server kaže: ${errText}` });

  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
