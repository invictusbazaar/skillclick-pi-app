import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serviceId, amount, sellerUsername, buyerUsername, paymentId, txid } = body;

    if (!serviceId || !amount || !sellerUsername || !buyerUsername || !paymentId) {
      return NextResponse.json({ error: 'Nedostaju podaci za obradu.' }, { status: 400 });
    }

    // 🚀 1. OBAVEZAN KORAK: Potvrda Pi Serveru (da se ne čeka 60s)
    try {
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, 
        { txid }, 
        { headers: { 'Authorization': `Key ${process.env.PI_API_KEY}` } });
        console.log("✅ Pi Server potvrdio transakciju.");
    } catch (e: any) {
        console.error("❌ Pi Server Error:", e.response?.data || e.message);
        // Čak i ako ovde baci grešku, nastavljamo jer je novac možda već prošao
    }

    // 2. Pronalaženje korisnika
    const buyer = await prisma.user.findUnique({ where: { username: buyerUsername } });
    const seller = await prisma.user.findUnique({ where: { username: sellerUsername } });

    if (!buyer || !seller) return NextResponse.json({ error: 'Korisnik nije pronađen.' }, { status: 404 });

    // 3. Kreiranje narudžbine u bazi
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

    // 4. Notifikacija prodavcu
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
    console.error("Order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
