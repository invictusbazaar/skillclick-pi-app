import { NextResponse } from 'next/server';
// ✅ KORISTIMO POSTOJEĆU VEZU, NE PRAVIMO NOVU
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serviceId, amount, sellerUsername, buyerUsername } = body;

    // 1. Provera podataka
    if (!serviceId || !amount || !sellerUsername || !buyerUsername) {
      return NextResponse.json({ error: 'Nedostaju podaci.' }, { status: 400 });
    }

    // 2. Nađi korisnike
    const buyer = await prisma.user.findUnique({ where: { username: buyerUsername } });
    const seller = await prisma.user.findUnique({ where: { username: sellerUsername } });

    if (!buyer || !seller) {
      return NextResponse.json({ error: 'Korisnik nije pronađen.' }, { status: 404 });
    }

    // 3. Zabrana kupovine od samog sebe
    if (buyer.id === seller.id) {
        return NextResponse.json({ error: 'Ne možeš kupiti svoju uslugu.' }, { status: 400 });
    }

    // 4. Kreiraj Order
    const newOrder = await prisma.order.create({
      data: {
        amount: parseFloat(amount),
        status: 'pending',
        buyerId: buyer.id,
        sellerId: seller.id,
        serviceId: serviceId
      }
    });

    return NextResponse.json({ success: true, order: newOrder });

  } catch (error: any) {
    console.error("Order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}