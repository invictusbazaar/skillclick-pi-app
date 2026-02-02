import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma"; // ✅ Koristimo našu centralnu prisma instancu

// Tvoj API KLJUČ (Ovaj radi, ali za produkciju je bolje da bude u .env fajlu)
const PI_API_KEY = "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Ovi podaci stižu iz BuyButton.tsx
    const { paymentId, txid, amount, sellerUsername, buyerUsername, serviceId } = body;

    console.log("🏁 COMPLETE RUTA POGOĐENA:", { paymentId, buyerUsername });

    if (!paymentId || !txid) {
        return NextResponse.json({ error: "Fale podaci (paymentId ili txid)" }, { status: 400 });
    }

    // 1. JAVLJAMO PI SERVERU DA JE GOTOVO (Obavezno za Pi SDK)
    console.log("📡 Šaljem potvrdu ka Pi serveru...");
    
    const piResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid })
    });

    if (!piResponse.ok) {
        const errorText = await piResponse.text();
        console.error("❌ Pi Complete Failed:", errorText);
        // Ako Pi odbije, prekidamo sve
        return NextResponse.json({ error: `Pi Greška: ${errorText}` }, { status: 500 });
    }

    const piData = await piResponse.json();
    console.log("✅ Pi transakcija uspešno kompletirana!");

    // 2. UPIS U BAZU (OVO JE FALILO!) 
    console.log("💾 Upisujem u bazu...");

    // A) Nađemo korisnike po username-u
    const buyer = await prisma.user.findUnique({ where: { username: buyerUsername } });
    const seller = await prisma.user.findUnique({ where: { username: sellerUsername } });

    if (!buyer || !seller) {
        console.error("❌ Greška: Kupac ili prodavac nisu nađeni u bazi!");
        // Vraćamo uspeh klijentu jer je Pi transakcija prošla, ali logujemo grešku baze
        return NextResponse.json({ success: true, warning: "User not found in DB", data: piData });
    }

    // B) Provera duplikata
    const existingOrder = await prisma.order.findUnique({
        where: { paymentId: paymentId }
    });

    if (!existingOrder) {
        // C) Kreiranje porudžbine
        const newOrder = await prisma.order.create({
            data: {
                amount: parseFloat(amount),
                paymentId: paymentId,
                txid: txid,
                status: "pending", // Čeka isplatu
                buyerId: buyer.id,
                sellerId: seller.id,
                serviceId: serviceId
            }
        });
        console.log("🎉 Porudžbina uspešno sačuvana! ID:", newOrder.id);
    } else {
        console.log("⚠️ Porudžbina već postoji u bazi.");
    }

    return NextResponse.json({ success: true, data: piData });

  } catch (error: any) {
    console.error("🔥 Fatalna greška u complete ruti:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
