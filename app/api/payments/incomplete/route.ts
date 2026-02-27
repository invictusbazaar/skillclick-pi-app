import { NextResponse } from 'next/server';

const API_KEY = process.env.PI_API_KEY || "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const paymentId = body.payment?.identifier;

    if (!paymentId) {
      return NextResponse.json({ error: 'Nema ID-a transakcije.' }, { status: 400 });
    }

    console.log(`[PAMETNO ČIŠĆENJE] Proveravam Pi server za ID: ${paymentId}`);

    // 1. KORAK: PITAJ PI SERVER ZA TAČNO STANJE
    const checkRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
        method: 'GET',
        headers: { 'Authorization': `Key ${API_KEY}` }
    });

    if (!checkRes.ok) {
        return NextResponse.json({ error: 'Ne mogu da dohvatim status sa Pi servera' }, { status: 400 });
    }

    const piData = await checkRes.json();
    const state = piData.status?.state;
    const txid = piData.transaction?.txid;

    console.log(`Stanje na Pi serveru: ${state}, TXID: ${txid || 'NEMA'}`);

    let resolveRes;

    // 2. KORAK: REŠI ZAGLAVLJENU TRANSAKCIJU NA OSNOVU PRAVOG STANJA
    if (txid) {
        // Ako Pi server prijavi da postoji TXID, on zahteva nasilno KOMPLETIRANJE, inače ne pušta
        resolveRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Key ${API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ txid: txid })
        });
    } else {
        // U suprotnom (ako je transakcija samo započeta pa prekinuta), zahteva OTKAZIVANJE
        resolveRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {
            method: 'POST',
            headers: { 'Authorization': `Key ${API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
    }

    const result = await resolveRes.json();
    console.log(`Rezultat akcije:`, result);

    return NextResponse.json({ success: true, result });

  } catch (error: any) {
    console.error("Greška u incomplete ruti:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
