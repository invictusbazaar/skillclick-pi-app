import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Forsiramo sveže podatke (da ne prikazuje stare ocene)
export const dynamic = 'force-dynamic';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export async function GET() {
  try {
    // 1. Učitavamo servise koji se prikazuju na početnoj
    const services = await prisma.service.findMany({
      include: {
        seller: {
          // 👇 KLJUČNO: Za svakog prodavca učitavamo SVE njegove usluge i njihove recenzije
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
      // Svi oglasi ovog prodavca
      const sellerServices = service.seller?.services || [];
      
      let totalStars = 0;
      let totalCount = 0;

      // Prolazimo kroz svaku uslugu koju ovaj čovek nudi
      sellerServices.forEach(s => {
        const reviews = s.reviews || [];
        // Sabiramo ocene iz te usluge
        reviews.forEach(r => {
          totalStars += (r.rating || 0);
          totalCount++;
        });
      });
      
      // Računamo globalni prosek
      const globalAverage = totalCount > 0 ? totalStars / totalCount : 0;

      return {
        ...service,
        author: service.seller, // Frontend očekuje 'author'
        // 👇 Šaljemo GLOBALNU ocenu prodavca, ne samo za ovaj oglas
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
    return NextResponse.json([], { status: 200 }); // Vraćamo prazno da ne pukne app
  }
}