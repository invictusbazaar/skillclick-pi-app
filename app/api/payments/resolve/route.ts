import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentId, txid } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'Nedostaje paymentId.' }, { status: 400 });
    }

    const apiKey = process.env.PI_API_KEY;

    if (txid && txid !== "N/A") {
        // 1. Pokušavamo da završimo transakciju ako postoji txid
        try {
            await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, 
            { txid }, 
            { headers: { 'Authorization': `Key ${apiKey}` } });
            console.log(`✅ Zapelo plaćanje ${paymentId} je uspešno završeno (complete).`);
            return NextResponse.json({ success: true, action: 'completed' });
        } catch (error: any) {
            console.log(`⚠️ Nije uspelo završavanje (complete), prelazim na cancel...`, error.response?.data || error.message);
        }
    }

    // 2. Ako nema txid ili complete nije uspeo, radimo cancel da odglavimo novčanik
    try {
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, 
        {}, 
        { headers: { 'Authorization': `Key ${apiKey}` } });
        console.log(`✅ Zapelo plaćanje ${paymentId} je uspešno otkazano (cancel).`);
        return NextResponse.json({ success: true, action: 'cancelled' });
    } catch (error: any) {
         console.error(`❌ Greška pri otkazivanju (cancel) plaćanja:`, error.response?.data || error.message);
         return NextResponse.json({ error: 'Nije moguće odglaviti plaćanje.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Resolve payment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}