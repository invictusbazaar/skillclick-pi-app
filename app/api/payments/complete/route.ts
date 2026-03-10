import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

const PI_API_KEY = "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // ✅ SADA OČEKUJEMO I PRAVO IME KUPCA SA DUGMETA
    const { paymentId, txid, buyerUsername: frontUsername } = body; 

    if (!paymentId || !txid) {
        return NextResponse.json({ error: "Fale podaci" }, { status: 400 });
    }

    const completeRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${PI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txid })
    });

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
    
    // ✅ KLJUČNO: Koristimo tvoje pravo ime. Ako ga iz nekog razloga nema, tek onda pravimo lažno.
    const buyerUsername = frontUsername || `pi_user_${buyerUid.substring(0, 8)}`; 

    console.log(`✅ Obrada porudžbine: Kupac(${buyerUsername}) -> Prodavac(${sellerUsername})`);

    if (sellerUsername) {
        await prisma.user.upsert({
            where: { username: sellerUsername },
            update: {},
            create: { username: sellerUsername, role: "user" }
        });
    }

    // ✅ SADA SE PORUDŽBINA VEZUJE ZA TVOJ PRAVI PROFIL
    const buyer = await prisma.user.upsert({
        where: { username: buyerUsername },
        update: { piId: buyerUid }, // Čuvamo tvoj Pi ID
        create: { username: buyerUsername, role: "user", piId: buyerUid }
    });

    let finalServiceId = serviceId;
    
    if (serviceId) {
        const serviceExists = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!serviceExists) {
            const anyService = await prisma.service.findFirst();
            finalServiceId = anyService ? anyService.id : null;
        }
    } else {
        const anyService = await prisma.service.findFirst();
        finalServiceId = anyService ? anyService.id : null;
    }

    if (!finalServiceId) return NextResponse.json({ error: "Nema usluge u bazi" }, { status: 400 });

    const existingOrder = await prisma.order.findUnique({
        where: { paymentId: paymentId }
    });

    if (!existingOrder) {
        const sellerUser = await prisma.user.findUnique({ where: { username: sellerUsername } });
        const sellerDbId = sellerUser ? sellerUser.id : buyer.id; 

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
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("🔥 GREŠKA:", error);
    return NextResponse.json({ success: true, error_log: error.message });
  }
}
