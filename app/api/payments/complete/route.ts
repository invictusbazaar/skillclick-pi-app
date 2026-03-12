import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

const PI_API_KEY = "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId, txid, buyerUsername: frontUsername } = body; 

    if (!paymentId || !txid) {
        return NextResponse.json({ error: "Fale podaci" }, { status: 400 });
    }

    // 1. OBAVEŠTAVANJE PI SERVERA
    const completeRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${PI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txid })
    });

    // 2. PREUZIMANJE PODATAKA OD PI SERVERA
    const paymentInfoRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
        method: 'GET',
        headers: { 'Authorization': `Key ${PI_API_KEY}` }
    });

    if (!paymentInfoRes.ok) throw new Error("Ne mogu preuzeti detalje.");

    const paymentData = await paymentInfoRes.json();
    const metadata = paymentData.metadata || {};
    const amount = paymentData.amount;
    const buyerUid = paymentData.user_uid; 
    
    const serviceId = metadata.listingId;
    const sellerUsername = metadata.sellerId; 
    
    const buyerUsername = frontUsername || `pi_user_${buyerUid.substring(0, 8)}`; 

    console.log(`✅ Obrada porudžbine: Kupac(${buyerUsername}) -> Prodavac(${sellerUsername})`);

    // 3. KREIRANJE ILI AŽURIRANJE KORISNIKA
    if (sellerUsername) {
        await prisma.user.upsert({
            where: { username: sellerUsername },
            update: {},
            create: { username: sellerUsername, role: "user" }
        });
    }

    // ✅ ISPRAVLJENO: Koristimo piUid (U umesto I)
    const buyer = await prisma.user.upsert({
        where: { username: buyerUsername },
        update: { piUid: buyerUid }, 
        create: { 
            username: buyerUsername, 
            role: "user", 
            piUid: buyerUid 
        }
    });

    // 4. PROVERA USLUGE
    let finalServiceId = serviceId;
    let serviceTitle = "uslugu"; // Podrazumevani tekst za notifikaciju
    
    if (serviceId) {
        const serviceExists = await prisma.service.findUnique({ where: { id: serviceId } });
        if (serviceExists) {
            serviceTitle = serviceExists.title; // Uzimamo pravo ime usluge za notifikaciju
        } else {
            const anyService = await prisma.service.findFirst();
            finalServiceId = anyService ? anyService.id : null;
        }
    } else {
        const anyService = await prisma.service.findFirst();
        finalServiceId = anyService ? anyService.id : null;
    }

    if (!finalServiceId) {
        return NextResponse.json({ error: "Nema usluge u bazi" }, { status: 400 });
    }

    // 5. UPIS PORUDŽBINE
    const existingOrder = await prisma.order.findUnique({
        where: { paymentId: paymentId }
    });

    if (!existingOrder) {
        const sellerUser = await prisma.user.findUnique({ where: { username: sellerUsername } });
        const sellerDbId = sellerUser ? sellerUser.id : buyer.id; 

        // Zapisujemo porudžbinu
        await prisma.order.create({
            data: {
                amount: parseFloat(amount),
                paymentId: paymentId,
                txid: txid,
                status: "pending", 
                buyerId: buyer.id,
                sellerId: sellerDbId,
                serviceId: finalServiceId
            }
        });

        // ✅ HIRURŠKI REZ: Kreiranje notifikacije za prodavca!
        if (sellerDbId !== buyer.id) { 
            await prisma.notification.create({
                data: {
                    userId: sellerDbId,
                    message: `Nova porudžbina! Korisnik ${buyerUsername} je kupio: ${serviceTitle}.`,
                    type: "new_order",
                    link: "/profile", 
                }
            });
        }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("🔥 KRITIČNA GREŠKA U BAZI:", error.message);
    // Vraćamo log nazad frontendu da bismo ga videli ako opet zapne
    return NextResponse.json({ success: false, error_log: error.message }, { status: 500 });
  }
}
