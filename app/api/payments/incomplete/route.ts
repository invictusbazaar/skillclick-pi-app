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
        console.log("⚠️ Pi server ne vidi ovu transakciju (404). Smatramo je rešenom.");
        return NextResponse.json({ success: true, status: "NOT_FOUND" });
    }

    const piData = await checkRes.json();
    // Pi v2 API vraća status kao objekat (cancelled: boolean, developer_completed: boolean, itd.)
    const statusObj = piData.status || {}; 
    const txid = piData.transaction?.txid;

    console.log(`📊 STATUS: Cancelled=${statusObj.cancelled}, Completed=${statusObj.developer_completed}, TXID=${txid || 'NEMA'}`);

    // 2. LOGIKA REŠAVANJA

    // A: Ako je već otkazana ili završena, ne radi ništa
    if (statusObj.cancelled || statusObj.developer_completed) {
        console.log("✅ Transakcija je već finalizovana.");
        return NextResponse.json({ success: true, status: "ALREADY_DONE" });
    }

    // B: Ako postoji TXID, korisnik je platio -> MORAMO KOMPLETIRATI
    if (txid) {
        console.log("💰 Postoji TXID, radim COMPLETE...");
        await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Key ${API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ txid: txid })
        });
    } 
    // C: Nema TXID -> MORAMO OTKAZATI
    else {
        console.log("🗑️ Nema TXID, radim CANCEL...");
        // Čak i ako vrati grešku, to je često zato što je već u procesu otkazivanja
        await fetch(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {
            method: 'POST',
            headers: { 'Authorization': `Key ${API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({}) 
        });
    }

    // Uvek vraćamo success da bi Pi SDK (onIncompletePaymentFound) sklonio transakciju iz reda
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("🔥 Greška u incomplete ruti:", error.message);
    // Ključno: Vraćamo success true da odblokiramo klijenta čak i ako server pukne
    return NextResponse.json({ success: true, note: "Forced success via catch" });
  }
}
