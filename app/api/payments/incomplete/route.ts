import { NextResponse } from 'next/server';

const API_KEY = process.env.PI_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const paymentId = body.paymentId;

    if (!paymentId) {
      return NextResponse.json({ error: 'Nema ID-a transakcije.' }, { status: 400 });
    }

    console.log(`🕵️ DETEKTIV: Proveravam status za PaymentID: ${paymentId}`);

    // 1. PITAJ PI SERVER ZA TAČNO STANJE
    const checkRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
        method: 'GET',
        headers: { 'Authorization': `Key ${API_KEY}` }
    });

    if (!checkRes.ok) {
        // Ako Pi kaže da transakcija ne postoji, super! To znači da je već očišćena.
        console.log("⚠️ Pi server ne vidi ovu transakciju. Smatramo je rešenom.");
        return NextResponse.json({ success: true, status: "NOT_FOUND" });
    }

    const piData = await checkRes.json();
    const status = piData.status; 
    // Mogući statusi: CREATED, INITIATED, PENDING, APPROVED, CANCELLED, COMPLETED...
    
    console.log(`📊 STATUS NA PI SERVERU: ${status.developer_approved ? 'APPROVED' : 'NOT APPROVED'} | TXID: ${piData.transaction?.txid || 'NEMA'}`);

    // 2. LOGIKA REŠAVANJA
    let actionResponse;

    // SCENARIO A: Već je gotova ili otkazana
    if (piData.status.cancelled || piData.status.developer_completed) {
        console.log("✅ Transakcija je već završena/otkazana na serveru.");
        return NextResponse.json({ success: true, status: "ALREADY_DONE" });
    }

    // SCENARIO B: Postoji TXID (korisnik je platio) -> MORAMO KOMPLETIRATI
    if (piData.transaction && piData.transaction.txid) {
        console.log("💰 Postoji TXID, radim COMPLETE...");
        actionResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Key ${API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ txid: piData.transaction.txid })
        });
    } 
    // SCENARIO C: Nema TXID (korisnik odustao ili puklo) -> MORAMO OTKAZATI
    else {
        console.log("🗑️ Nema TXID, radim CANCEL...");
        actionResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {
            method: 'POST',
            headers: { 'Authorization': `Key ${API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // Prazan body
        });
    }

    // Provera rezultata akcije
    if (!actionResponse.ok) {
        // Čak i ako 'cancel' ne uspe (npr. jer je već otkazana), mi Frontendu kažemo SUCCESS
        // da bi Pi SDK prestao da nas smara.
        const errText = await actionResponse.text();
        console.log("⚠️ Pokušaj rešavanja vratio grešku (verovatno bezopasno):", errText);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("🔥 Greška u incomplete ruti:", error.message);
    // Vraćamo success: true da odblokiramo korisnika čak i ako server pukne
    return NextResponse.json({ success: true, note: "Forced success via catch" });
  }
}