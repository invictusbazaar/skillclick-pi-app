import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// 👇 OVO JE KLJUČNO: Govori Vercelu da uvek povlači sveže podatke iz baze!
export const dynamic = 'force-dynamic';

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
    const formattedServices = services.map(service => ({
      ...service,
      author: service.seller 
    }));

    // 👇 Vraćamo podatke uz naredbu pretraživaču da NE PAMTI (ne kešira) stari rezultat
    return NextResponse.json(formattedServices, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error("Greška pri učitavanju oglasa:", error);
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}