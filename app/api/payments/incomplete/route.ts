import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
    }

    console.log(`[Incomplete] Rešavam zaglavljenu transakciju: ${paymentId}`);

    // 1. Proveravamo status na Pi serveru
    const piRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
      },
    });

    if (!piRes.ok) {
        // Ako Pi server kaže da ne postoji, znači da je već obrisana.
        // Vraćamo 'fixed' da frontend zna da je put čist.
        return NextResponse.json({ status: 'fixed' });
    }

    const payment = await piRes.json();

    // 2. Odlučujemo šta da radimo (Complete ili Cancel)
    // Ako postoji TXID, znači da su coini poslati -> MORAMO uraditi complete
    if (payment.transaction && payment.transaction.txid) {
        console.log(`[Incomplete] Pronađen TXID, kompletiram transakciju...`);
        await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${process.env.PI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ txid: payment.transaction.txid }),
        });
    } else {
        // Ako nema TXID, samo je otkazujemo da odblokiramo korisnika
        console.log(`[Incomplete] Nema TXID, otkazujem transakciju...`);
        await fetch(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${process.env.PI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}), // Prazan objekat je obavezan
        });
    }

    // 3. KLJUČNO: Vraćamo status koji BuyButton prepoznaje
    return NextResponse.json({ status: 'fixed' });

  } catch (error) {
    console.error('[Incomplete] Error:', error);
    // Čak i ako pukne greška, vraćamo 'fixed' da pokušamo da odblokiramo frontend
    return NextResponse.json({ status: 'fixed' });
  }
}
