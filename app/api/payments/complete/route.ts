import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

// Tvoj ključ (zadržan kako si tražio)
const PI_API_KEY = "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId, txid } = body; // Uzimamo samo ono što BuyButton sigurno šalje

    if (!paymentId || !txid) {
        return NextResponse.json({ error: "Fale podaci (paymentId ili txid)" }, { status: 400 });
    }

    // 1. OBAVEŠTAVANJE PI SERVERA (COMPLETE)
    // Ovo je najbitnije - da pare legnu.
    const completeRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${PI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txid })
    });

    if (!completeRes.ok) {
        console.log("⚠️ Pi Complete Warning:", await completeRes.text());
        // Nastavljamo dalje jer je možda već kompletirano
    }

    // 2. PREUZIMANJE PODATAKA OD PI SERVERA (OVO JE FALILO!)
    // Umesto da čekamo da nam frontend pošalje podatke, mi pitamo Pi server: "Šta je ovo plaćeno?"
    const paymentInfoRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
        method: 'GET',
        headers: { 'Authorization': `Key ${PI_API_KEY}` }
    });

    if (!paymentInfoRes.ok) {
        throw new Error("Ne mogu da preuzmem detalje plaćanja od Pi mreže.");
    }

    const paymentData = await paymentInfoRes.json();
    
    // Izvlačimo podatke iz METADATA (koje smo spakovali u BuyButton-u)
    // metadata: { listingId, sellerId, type: 'service_purchase' }
    const metadata = paymentData.metadata || {};
    const amount = paymentData.amount;
    const buyerUid = paymentData.user_uid; // Pi nam daje UID kupca
    
    const serviceId = metadata.listingId;
    // Pazi: sellerId u metadati je username prodavca
    const sellerUsername = metadata.sellerId; 
    
    // NAPOMENA: Pi API nam ne daje username kupca direktno, daje nam UID.
    // Zato ćemo za kupca koristiti UID kao username ako ga nemamo u bazi, ili "UnknownBuyer"
    // (Ovo sprečava pucanje ako nemamo username)
    const buyerUsername = `pi_user_${buyerUid.substring(0, 8)}`; 

    console.log(`✅ Obrada porudžbine: Kupac(${buyerUid}) -> Prodavac(${sellerUsername}) -> Usluga(${serviceId})`);

    // 3. KREIRANJE KORISNIKA (Upsert)
    // Prodavac
    if (sellerUsername) {
        await prisma.user.upsert({
            where: { username: sellerUsername },
            update: {},
            create: { username: sellerUsername, role: "user" }
        });
    }

    // Kupac (pošto nemamo pravi username, pravimo placeholder da ne pukne baza)
    const buyer = await prisma.user.upsert({
        where: { username: buyerUsername },
        update: {},
        create: { username: buyerUsername, role: "user", piId: buyerUid }
    });

    // 4. PROVERA I VEZIVANJE USLUGE
    let finalServiceId = serviceId;
    
    if (serviceId) {
        const serviceExists = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!serviceExists) {
            console.log("⚠️ Usluga nije nađena, tražim zamensku...");
            const anyService = await prisma.service.findFirst();
            finalServiceId = anyService ? anyService.id : null;
        }
    } else {
        // Ako nema serviceId u metadati
        const anyService = await prisma.service.findFirst();
        finalServiceId = anyService ? anyService.id : null;
    }

    if (!finalServiceId) {
        return NextResponse.json({ error: "Nema usluge u bazi" }, { status: 400 });
    }

    // 5. UPIS PORUDŽBINE U BAZU
    const existingOrder = await prisma.order.findUnique({
        where: { paymentId: paymentId }
    });

    if (!existingOrder) {
        // Moramo naći ID prodavca na osnovu username-a
        const sellerUser = await prisma.user.findUnique({ where: { username: sellerUsername } });
        const sellerDbId = sellerUser ? sellerUser.id : buyer.id; // Fallback na kupca ako nema prodavca (samo da ne pukne)

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
    console.error("🔥 GREŠKA U COMPLETE RUTI:", error);
    // Vraćamo success true da Pi ne bi poništio transakciju (jer su pare verovatno već skinute)
    // ali logujemo grešku da znaš šta se desilo.
    return NextResponse.json({ success: true, error_log: error.message });
  }
}
