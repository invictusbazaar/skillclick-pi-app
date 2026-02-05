import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Kreira novu porudžbinu (Ovo koristi dugme "Kupi")
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serviceId, amount, sellerUsername, buyerUsername } = body;

    // 1. Provera da li su podaci stigli
    if (!serviceId || !amount || !sellerUsername || !buyerUsername) {
      return NextResponse.json({ error: 'Nedostaju podaci za kupovinu.' }, { status: 400 });
    }

    // 2. Nađi kupca i prodavca u bazi
    const buyer = await prisma.user.findUnique({ where: { username: buyerUsername } });
    const seller = await prisma.user.findUnique({ where: { username: sellerUsername } });

    if (!buyer || !seller) {
      return NextResponse.json({ error: 'Korisnik (kupac ili prodavac) nije pronađen.' }, { status: 404 });
    }

    // 3. Zabrani kupovinu od samog sebe
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

    return NextResponse.json({ success: true, order: newOrder });

  } catch (error: any) {
    console.error("Order error:", error);
    return NextResponse.json({ error: "Serverska greška: " + error.message }, { status: 500 });
  }
}