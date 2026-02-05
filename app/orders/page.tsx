import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serviceId, amount, sellerUsername, buyerUsername } = body;

    // 1. Provera podataka
    if (!serviceId || !amount || !sellerUsername || !buyerUsername) {
      return NextResponse.json({ error: 'Nedostaju podaci za kupovinu.' }, { status: 400 });
    }

    // 2. Nađi kupca i prodavca u bazi
    const buyer = await prisma.user.findUnique({ where: { username: buyerUsername } });
    const seller = await prisma.user.findUnique({ where: { username: sellerUsername } });

    if (!buyer || !seller) {
      return NextResponse.json({ error: 'Korisnik (kupac ili prodavac) nije pronađen.' }, { status: 404 });
    }

    // 3. Zabrana kupovine od samog sebe
    if (buyer.id === seller.id) {
        return NextResponse.json({ error: 'Ne možeš kupiti svoju uslugu.' }, { status: 400 });
    }

    // 4. Kreiraj Order u bazi
    const newOrder = await prisma.order.create({
      data: {
        amount: parseFloat(amount),
        status: 'pending', // Čeka se isplata
        buyerId: buyer.id,
        sellerId: seller.id,
        serviceId: serviceId
      }
    });

    console.log("✅ Order created:", newOrder.id);
    return NextResponse.json({ success: true, order: newOrder });

  } catch (error: any) {
    console.error("❌ Order API Error:", error);
    return NextResponse.json({ error: "Greška na serveru: " + error.message }, { status: 500 });
  }
}
