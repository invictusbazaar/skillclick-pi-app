import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// --- OVO JE SIGURNA KONEKCIJA (Singleton pattern) ---
// Ovim sprečavamo da se baza preoptereti, a sve je u jednom fajlu
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// --- GLAVNA FUNKCIJA ---
export async function GET() {
  try {
    console.log("🔄 Povezujem se na bazu...");
    const services = await prisma.service.findMany({
      include: {
        seller: true,
        reviews: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Nađeno ${services.length} oglasa.`);

    const formattedServices = services.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price,
      category: service.category,
      author: service.seller ? service.seller.username : 'Nepoznat', 
      reviews: service.reviews.length,
      rating: 5.0,
      images: service.images
    }));

    return NextResponse.json(formattedServices);
  } catch (error) {
    console.error("❌ GREŠKA U API-ju:", error);
    // Vraćamo prazan niz da sajt ne pukne skroz ako baza zeza
    return NextResponse.json([], { status: 500 });
  }
}