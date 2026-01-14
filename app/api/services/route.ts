import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export async function GET() {
  try {
    // Čitamo sve servise i uključujemo podatke o prodavcu (seller)
    const services = await prisma.service.findMany({
      include: {
        seller: true, // U bazi se zove 'seller'
      },
      orderBy: {
        createdAt: 'desc', // Najnoviji oglasi prvi
      }
    });

    // Mapiramo podatke da odgovaraju onome što frontend očekuje
    // Frontend traži 'author', a baza ima 'seller', pa ih ovde povezujemo
    const formattedServices = services.map(service => ({
      ...service,
      author: service.seller // Ovde pravimo tu vezu
    }));

    return NextResponse.json(formattedServices);
  } catch (error) {
    console.error("Greška pri učitavanju oglasa:", error);
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}
