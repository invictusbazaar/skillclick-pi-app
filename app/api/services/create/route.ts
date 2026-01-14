import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, category, price, deliveryTime, revisions, author, images } = body;

    // 1. Nađi ili napravi korisnika
    let user = await prisma.user.findUnique({
      where: { username: author }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { 
            username: author,
            role: author === 'Ilija1969' ? 'admin' : 'user'
        }
      });
    }

    // 2. Upisivanje oglasa (Pazimo na userId polje iz tvoje šeme)
    const newService = await prisma.service.create({
      data: {
        title,
        description,
        category,
        price: parseFloat(price),
        // Ovi podaci nisu u šemi ali ih možemo dodati u opis ili ignorisati ako šema ne podržava
        // Za sada ih ne upisujemo direktno ako polja ne postoje u Service modelu
        images: images || [], 
        userId: user.id, // BITNO: Koristimo userId kako piše u tvojoj šemi
      },
    });

    return NextResponse.json({ success: true, service: newService });

  } catch (error) {
    console.error("Greška pri kreiranju oglasa:", error);
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}