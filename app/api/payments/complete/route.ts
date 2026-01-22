import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client'; // ⚠️ Baza je privremeno isključena da ne pravi greške

// 👇 OVDE OBAVEZNO ZALEPI ISTI ONAJ DUGAČKI KLJUČ KAO U APPROVE FAJLU
const PI_API_KEY = "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId, txid } = body;

    console.log("🏁 COMPLETE ruta pogođena!", { paymentId, txid });

    if (!paymentId || !txid) {
        return NextResponse.json({ error: "Fale podaci (paymentId ili txid)" }, { status: 400 });
    }

    // Provera ključa
    if (PI_API_KEY === "OVDE_ZALEPI_TVOJ_DUGACKI_API_KEY" || !PI_API_KEY) {
         console.error("❌ ZABORAVIO SI KLJUČ U COMPLETE FAJLU!");
         return NextResponse.json({ error: "Fali API Key" }, { status: 500 });
    }

    // 1. Javljamo Pi Networku da je gotovo (NAJVAŽNIJI KORAK)
    console.log("📡 Šaljem potvrdu ka Pi serveru...");
    
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Pi Complete Failed:", errorText);
        return NextResponse.json({ error: `Pi Greška: ${errorText}` }, { status: 500 });
    }

    const data = await response.json();
    console.log("✅ Pi transakcija uspešno kompletirana!");

    // 2. Upis u bazu (Ostavljamo za kasnije, sada je bitno da Pi potvrdi)
    /* const prisma = new PrismaClient();
    await prisma.order.create({
        data: {
            paymentId,
            txid,
            status: 'paid',
            // Ostali podaci...
        }
    });
    */

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("🔥 Greška u complete ruti:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}