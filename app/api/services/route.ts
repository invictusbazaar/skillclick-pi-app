import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Forsiramo sveže podatke (da ne prikazuje stare ocene)
export const dynamic = 'force-dynamic';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export async function GET(request: Request) {
  try {
    // Proveravamo da li nam zahtev stiže iz Admin panela
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get('all') === 'true';

    // 1. Učitavamo servise koji se prikazuju
    const services = await prisma.service.findMany({
      // Ako nije Admin (fetchAll je false), traži isključivo odobrene oglase!
      where: fetchAll ? undefined : { isApproved: true },
      include: {
        seller: {
          include: {
            services: {
              include: {
                reviews: true
              }
            }
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    // 2. Računamo GLOBALNI rejting prodavca
    const formattedServices = services.map(service => {
      const sellerServices = service.seller?.services || [];
      
      let totalStars = 0;
      let totalCount = 0;

      sellerServices.forEach(s => {
        const reviews = s.reviews || [];
        reviews.forEach(r => {
          totalStars += (r.rating || 0);
          totalCount++;
        });
      });
      
      const globalAverage = totalCount > 0 ? totalStars / totalCount : 0;

      return {
        ...service,
        author: service.seller, 
        sellerRating: globalAverage, 
        reviewCount: totalCount
      };
    });

    return NextResponse.json(formattedServices, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error("Greška pri učitavanju oglasa:", error);
    return NextResponse.json([], { status: 200 }); 
  }
}

// 👇 NOVO: Dodajemo PATCH metodu koja TRAJNO čuva tvoje odobrenje u bazi!
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isApproved } = body;

    if (!id) {
      return NextResponse.json({ error: "Nedostaje ID oglasa." }, { status: 400 });
    }

    // Ažuriramo status u bazi podataka
    const updatedService = await prisma.service.update({
      where: { id: String(id) },
      data: { isApproved: Boolean(isApproved) }
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Greška pri menjanju statusa oglasa:", error);
    return NextResponse.json({ error: "Sistemska greška pri ažuriranju baze." }, { status: 500 });
  }
}
