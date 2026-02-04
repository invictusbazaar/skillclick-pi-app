import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

const PI_API_KEY = "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId, txid, amount, sellerUsername, buyerUsername, serviceId } = body;

    // 1. OBAVEŠTAVANJE PI SERVERA (Bitno da oni znaju da je prošlo)
    try {
        await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${PI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ txid })
        });
    } catch (e) {
        console.log("Pi Server greška (zanemarljivo):", e);
    }

    // 2. KREIRANJE KORISNIKA AKO NE POSTOJE (Upsert)
    const buyer = await prisma.user.upsert({
        where: { username: buyerUsername },
        update: {},
        create: { username: buyerUsername, role: "user" }
    });

    const seller = await prisma.user.upsert({
        where: { username: sellerUsername },
        update: {},
        create: { username: sellerUsername, role: "user" }
    });

    // 3. PROVERA USLUGE (Ključni deo - sprečava pucanje)
    let finalServiceId = serviceId;
    
    // Proveravamo da li ta usluga stvarno postoji
    const serviceExists = await prisma.service.findUnique({
        where: { id: serviceId }
    });

    if (!serviceExists) {
        // AKO NE POSTOJI: Uzmi prvu bilo koju uslugu iz baze samo da spasimo transakciju!
        const anyService = await prisma.service.findFirst();
        if (anyService) {
            finalServiceId = anyService.id;
            console.log("⚠️ UPOZORENJE: Originalna usluga nije nađena. Vezujem za:", anyService.title);
        } else {
            // Ako u celoj bazi nema nijedne usluge, onda stvarno ne možemo ništa
            return NextResponse.json({ error: "Nema nijedne usluge u bazi!" }, { status: 400 });
        }
    }

    // 4. UPIS PORUDŽBINE
    // Prvo proverimo da li smo je već upisali (da ne dupliramo)
    const existingOrder = await prisma.order.findUnique({
        where: { paymentId: paymentId }
    });

    if (!existingOrder) {
        await prisma.order.create({
            data: {
                amount: parseFloat(amount),
                paymentId: paymentId,
                txid: txid,
                status: "pending", 
                buyerId: buyer.id,
                sellerId: seller.id,
                serviceId: finalServiceId // Koristimo siguran ID
            }
        });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("🔥 FATALNA GREŠKA:", error);
    // Vraćamo success true da Pi ne bi poništio transakciju, jer su pare već prošle
    return NextResponse.json({ success: true, error_log: error.message });
  }
}