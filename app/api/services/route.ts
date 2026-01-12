import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Vučemo sve oglase iz baze podataka uključujući podatke o autoru
    const services = await prisma.service.findMany({
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(services, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error("Greška u API-ju:", error);
    return NextResponse.json([], { status: 200 });
  }
}