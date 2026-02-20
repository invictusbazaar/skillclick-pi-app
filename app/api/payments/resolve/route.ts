import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ error: 'Nedostaje paymentId.' }, { status: 400 });
    }

    // Sigurnosna rezerva za ključ
    const apiKey = process.env.PI_API_KEY || "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp";

    // 1. DOHVATI TRENUTNI STATUS DIREKTNO SA PI SERVERA
    let paymentData;
    try {
        const getRes = await axios.get(`https://api.minepi.com/v2/payments/${paymentId}`, {
            headers: { 'Authorization': `Key ${apiKey}` }
        });
        paymentData = getRes.data;
    } catch (err: any) {
        console.error("Greška pri dohvatanju plaćanja:", err.response?.data || err.message);
        return NextResponse.json({ error: 'Ne mogu da dohvatim status sa Pi servera.' }, { status: 500 });
    }

    const status = paymentData.status;
    const realTxid = paymentData.transaction?.txid;

    console.log(`🔍 Status zapelog plaćanja ${paymentId} je: ${status}. Txid: ${realTxid || "Nema"}`);

    // 2. PAMETNO REŠAVANJE NA OSNOVU STATUSA
    if (status === 'APPROVED' && realTxid) {
        // Mora COMPLETE jer je odobreno na blockchainu
        try {
            await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, 
            { txid: realTxid }, 
            { headers: { 'Authorization': `Key ${apiKey}` } });
            console.log(`✅ Plaćanje usiljeno ZAVRŠENO (complete).`);
            return NextResponse.json({ success: true, action: 'completed_from_server' });
        } catch (e: any) {
            console.error("Greška pri complete:", e.response?.data || e.message);
            return NextResponse.json({ error: 'Nije uspeo complete' }, { status: 500 });
        }
    } else if (status === 'CREATED') {
        // Nije prošlo na blockchain, može CANCEL
        try {
            await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, 
            {}, 
            { headers: { 'Authorization': `Key ${apiKey}` } });
            console.log(`✅ Plaćanje usiljeno OTKAZANO (cancel).`);
            return NextResponse.json({ success: true, action: 'cancelled_created' });
        } catch (e: any) {
             console.error("Greška pri cancel:", e.response?.data || e.message);
             return NextResponse.json({ error: 'Nije uspeo cancel' }, { status: 500 });
        }
    } else {
        // Već rešeno (COMPLETED ili CANCELLED)
        console.log(`Plaćanje je već u statusu: ${status}.`);
        return NextResponse.json({ success: true, action: `already_${status}` });
    }

  } catch (error: any) {
    console.error("Fatalna greška u resolve ruti:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
