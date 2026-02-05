import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Kreiranje nove recenzije
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, rating, comment, authorUsername } = body;

    // 1. Provera podataka
    if (!orderId || !rating || !authorUsername) {
      return NextResponse.json({ error: 'Nedostaju podaci.' }, { status: 400 });
    }

    // 2. Nađi korisnika koji ostavlja ocenu
    const author = await prisma.user.findUnique({ where: { username: authorUsername } });
    if (!author) {
        return NextResponse.json({ error: 'Korisnik nije pronađen.' }, { status: 404 });
    }

    // 3. Nađi porudžbinu
    const order = await prisma.order.findUnique({ 
        where: { id: orderId },
        include: { reviews: true } // Učitaj postojeće recenzije da vidimo da li je već ocenio
    });

    if (!order) {
        return NextResponse.json({ error: 'Porudžbina ne postoji.' }, { status: 404 });
    }

    // 4. Provera: Da li je ovaj korisnik VEĆ ocenio?
    // (Baza sada dozvoljava više ocena za isti Order, ali jedna osoba sme samo jednom da oceni)
    const alreadyReviewed = order.reviews.some((r: any) => r.userId === author.id);
    
    if (alreadyReviewed) {
        return NextResponse.json({ error: 'Već ste ocenili ovu transakciju.' }, { status: 400 });
    }

    // 5. Odredi ID usluge (ako postoji)
    if (!order.serviceId) {
        return NextResponse.json({ error: 'Greška: Porudžbina nije vezana za uslugu.' }, { status: 400 });
    }

    // 6. Kreiraj Recenziju u BAZI
    const newReview = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment: comment || "",
        userId: author.id,       // Ko je ocenio
        serviceId: order.serviceId, // Koju uslugu
        orderId: orderId         // Za koju porudžbinu
      }
    });

    return NextResponse.json(newReview);

  } catch (error: any) {
    console.error("Review error:", error);
    return NextResponse.json({ error: error.message || "Greška na serveru" }, { status: 500 });
  }
}
