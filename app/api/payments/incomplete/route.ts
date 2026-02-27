import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma"; // DODATO: Uvozimo bazu da iskopamo txid!

const API_KEY = process.env.PI_API_KEY || "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp";

export async function POST(req: Request) {
  try {
    const { payment } = await req.json();
    const paymentId = payment?.identifier;
    let txid = payment?.transaction?.txid;

    if (!paymentId) {
      return NextResponse.json({ error: 'Nema ID-a transakcije.' }, { status: 400 });
    }

    // 🔥 KLJUČNI DEO: Ako Pi SDK nije poslao txid, tražimo ga u NAŠOJ bazi!
    if (!txid) {
        console.log(`🔍 Pi nije poslao TXID. Pretražujem bazu za PaymentID: ${paymentId}`);
        const existingOrder = await prisma.order.findFirst({
            where: { paymentId: paymentId }
        });
        
        if (existingOrder && existingOrder.txid) {
            txid = existingOrder.txid;
            console.log(`✅ Pronađen TXID u bazi: ${txid}. Idemo na nasilno kompletiranje!`);
        }
    }

    let piResponse;

    if (txid) {
        // Sada imamo TXID i forsiramo /complete komandu!
        piResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: { 
                'Authorization': `Key ${API_KEY}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ txid })
        });
    } else {
        // Ako TXID apsolutno ne postoji nigde (duh transakcija bez plaćanja)
        piResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {
            method: 'POST',
            headers: { 
                'Authorization': `Key ${API_KEY}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({}) 
        });
    }

    const data = await piResponse.json();
    console.log("📡 Odgovor sa Pi Servera nakon nasilnog čišćenja:", data);

    // Čak i ako Pi vrati neku svoju grešku, mi frontendu vraćamo success 
    // kako bismo zaustavili onaj iritantni alert loop kod kupca.
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("❌ Fatalna greška u incomplete ruti:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
