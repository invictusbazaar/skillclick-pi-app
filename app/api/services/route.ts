import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Ova linija sprečava Next.js da otvara previše konekcija ka bazi
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export async function GET() {
  try {
    // Proveravamo direktno bazu
    const services = await prisma.service.findMany({
      include: { author: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(services, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error("Greška pri čitanju iz baze:", error);
    return NextResponse.json({ error: "Baza nije dostupna" }, { status: 500 });
  }
}