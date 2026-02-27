import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

// Rezervni ključ koji ignoriše Vercel bagove
const API_KEY = process.env.PI_API_KEY || "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serviceId, amount, sellerUsername, buyerUsername, paymentId, txid } = body;

    if (!serviceId || !amount || !sellerUsername || !buyerUsername || !paymentId) {
      return NextResponse.json({ error: 'Nedostaju podaci za obradu.' }, { status: 400 });
    }

    // 1. Provera da li ista transakcija (paymentId) već postoji (sprečava duplo procesiranje iste uplate)
    const existingPayment = await prisma.order.findUnique({ where: { paymentId } });
    if (existingPayment) {
        console.log("⚠️ UPLATA već postoji u bazi. Vraćam success.");
        return NextResponse.json({ success: true, order: existingPayment });
    }

    // 2. Pronalaženje korisnika (moramo prvo naći ID-jeve za dalju proveru)
    const buyer = await prisma.user.findUnique({ where: { username: buyerUsername } });
    const seller = await prisma.user.findUnique({ where: { username: sellerUsername } });

    if (!buyer || !seller) return NextResponse.json({ error: 'Korisnik nije pronađen.' }, { status: 404 });

    // 3. PAMETNA PROVERA ZA PONOVNU KUPOVINU:
    // Proveravamo da li kupac već ima AKTIVNU narudžbinu za ovu istu uslugu.
    // Ako je status 'refunded' ili 'completed', DOZVOLJAVAMO novu kupovinu!
    const activeOrder = await prisma.order.findFirst({
        where: {
            buyerId: buyer.id,
            serviceId: serviceId,
            status: {
                in: ['pending', 'in_progress', 'disputed_buyer', 'disputed_seller']
            }
        }
    });

    if (activeOrder) {
        return NextResponse.json({ error: 'Već imate aktivnu narudžbinu za ovu uslugu. Ne možete kupiti ponovo dok se prethodna ne završi ili refundira.' }, { status: 400 });
    }

    // 4. Potvrda Pi Serveru
    try {
        const piResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Key ${API_KEY}` 
            },
            body: JSON.stringify({ txid })
        });
        
        const piData = await piResponse.json();
        if (!piResponse.ok) {
            console.error("❌ Pi Server je odbio potvrdu:", piData);
        } else {
            console.log("✅ Pi Server odgovor:", piData);
        }
    } catch (e: any) {
        console.error("❌ Greška pri komunikaciji sa Pi serverom:", e.message);
    }

    // 5. Kreiranje narudžbine u bazi
    const newOrder = await prisma.order.create({
      data: {
        amount: parseFloat(amount),
        status: 'pending',
        buyerId: buyer.id,
        sellerId: seller.id,
        serviceId: serviceId,
        paymentId,
        txid
      }
    });

    // 6. Notifikacija prodavcu
    await prisma.notification.create({
        data: {
            userId: seller.id, 
            type: 'order',
            message: `🎉 Nova porudžbina! ${buyerUsername} je kupio uslugu!`,
            link: `/profile`, 
            isRead: false
        }
    }).catch(e => console.error("Notif Error:", e));

    return NextResponse.json({ success: true, order: newOrder });

  } catch (error: any) {
    console.error("🔥 Order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
