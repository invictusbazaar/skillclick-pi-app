import { NextResponse } from 'next/server';

const API_KEY = process.env.PI_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const paymentId = body.paymentId;

    if (!paymentId) {
      return NextResponse.json({ error: 'Nema ID-a transakcije.' }, { status: 400 });
    }

    console.log(`🕵️ AUTO-FIX: Proveravam PaymentID: ${paymentId}`);

    // 1. Provera statusa na Pi Serveru
    const checkRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
        method: 'GET',
        headers: { 'Authorization': `Key ${API_KEY}` }
    });

    if (!checkRes.ok) {
        // Ako ne postoji, znači da je već obrisana. Super.
        return NextResponse.json({ success: true, status: "NOT_FOUND" });
    }

    const piData = await checkRes.json();
    const status = piData.status || {};
    const txid = piData.transaction?.txid;

    console.log(`📊 PI STATUS: Cancelled=${status.cancelled}, Completed=${status.developer_completed}, TXID=${txid || 'NEMA'}`);

    // 2. LOGIKA - BITNO:
    // Ako je već Completed ili Cancelled, samo vraćamo success da SDK skapira da je gotovo.
    if (status.cancelled || status.developer_completed) {
        return NextResponse.json({ success: true, status: "ALREADY_DONE" });
    }

    // Ako nije gotovo, moramo ga završiti ili otkazati
    if (txid) {
        // Ako ima TXID, moramo uraditi complete (čak i ako je refundirano mimo protokola)
        await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Key ${API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ txid: txid })
        });
    } else {
        // Ako nema TXID, otkazujemo
        await fetch(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {
            method: 'POST',
            headers: { 'Authorization': `Key ${API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({}) 
        });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("🔥 Greška u incomplete ruti:", error.message);
    // UVEK vraćamo true da odglavimo telefon
    return NextResponse.json({ success: true, note: "Forced success via catch" });
  }
}
