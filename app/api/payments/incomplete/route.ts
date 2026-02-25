import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payment } = body;

    // Caka: Kod Pi SDK-a, ID zaglavljene transakcije se zove 'identifier'
    const paymentId = payment.identifier;
    const txid = payment.transaction?.txid;

    if (!paymentId) {
      return NextResponse.json({ error: 'Nema ID-a transakcije.' }, { status: 400 });
    }

    if (!process.env.PI_API_KEY) {
      console.error("Fali PI_API_KEY u Vercelu!");
      return NextResponse.json({ error: 'Server greška' }, { status: 500 });
    }

    // Ako postoji txid, novac je bio skinut, pa transakciju KOMPLETIRAMO da bi se zatvorila
    if (txid) {
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`,
            { txid },
            { headers: { 'Authorization': `Key ${process.env.PI_API_KEY}` } }
        );
        console.log(`✅ Zaglavljena transakcija ${paymentId} je KOMPLETIRANA i očišćena.`);
    } else {
        // Ako nema txid, novac nije ni skinut, pa je samo OTKAZUJEMO
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/cancel`,
            {},
            { headers: { 'Authorization': `Key ${process.env.PI_API_KEY}` } }
        );
        console.log(`✅ Zaglavljena transakcija ${paymentId} je OTKAZANA i očišćena.`);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("❌ Greška pri čišćenju zaglavljene transakcije:", error.response?.data || error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
