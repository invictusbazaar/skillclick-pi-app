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

    // 🛑 1. PAMETNA PROVERA (Sprečava pucanje servera na 60 sekundi!)
    // Ako narudžbina već postoji, reci Pi serveru da je sve u redu i završi odmah.
    const existingOrder = await prisma.order.findUnique({ where: { paymentId } });
    if (existingOrder) {
        console.log("⚠️ Narudžbina već postoji u bazi. Vraćam success da bih odblokirao Pi aplikaciju.");
        return NextResponse.json({ success: true, order: existingOrder });
    }

    // 🚀 2. Potvrda Pi Serveru
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

    // 3. Pronalaženje korisnika
    const buyer = await prisma.user.findUnique({ where: { username: buyerUsername } });
    const seller = await prisma.user.findUnique({ where: { username: sellerUsername } });

    if (!buyer || !seller) return NextResponse.json({ error: 'Korisnik nije pronađen.' }, { status: 404 });

    // 4. Kreiranje narudžbine u bazi
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

    // 5. Notifikacija prodavcu
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