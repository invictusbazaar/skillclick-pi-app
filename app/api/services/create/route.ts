import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, category, price, images, author } = body;

    // Provera da li fale podaci
    if (!title || !price || !author) {
        return NextResponse.json({ error: "Fale obavezni podaci" }, { status: 400 });
    }

    // 1. Nađi ili napravi korisnika
    let user = await prisma.user.findUnique({ where: { username: author } });

    if (!user) {
      user = await prisma.user.create({
        data: { username: author, role: 'user' }
      });
    }

    // 2. Upisivanje oglasa
    const newService = await prisma.service.create({
      data: {
        title,
        description,
        category,
        price: parseFloat(price),
        images: images || [],
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, service: newService });

  } catch (error: any) {
    console.error("Greška:", error);
    return NextResponse.json({ error: error.message || "Greška na serveru" }, { status: 500 });
  }
}