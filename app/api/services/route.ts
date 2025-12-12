import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Kreiramo instancu Prisma klijenta da pričamo sa bazom
const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Čupamo sve oglase direktno iz Postgres baze
    const services = await prisma.service.findMany({
      include: {
        seller: true,   // Daj mi podatke o onome ko je postavio oglas (username)
        reviews: true   // Daj mi recenzije
      },
      orderBy: {
        createdAt: 'desc' // Najnoviji oglasi prvi
      }
    });

    // 2. Formatiramo podatke da odgovaraju onome što tvoj sajt (frontend) očekuje
    const formattedServices = services.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price,
      category: service.category,
      // Ovde mapiramo: baza ima 'seller', a sajt traži 'author'
      author: service.seller ? service.seller.username : 'Nepoznat', 
      reviews: service.reviews.length,
      rating: 5.0, // Fiksno dok ne napravimo računanje proseka
      images: service.images
    }));

    // Vraćamo podatke sajtu
    return NextResponse.json(formattedServices);
  } catch (error) {
    console.error("Greška pri učitavanju oglasa iz baze:", error);
    return NextResponse.json({ error: 'Greška na serveru' }, { status: 500 });
  }
}

// Opciono: POST metoda za kreiranje novih oglasa preko sajta (kad to budeš radio)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Kreiranje u bazi
    const newService = await prisma.service.create({
      data: {
        title: body.title,
        description: body.description,
        price: parseFloat(body.price),
        category: body.category,
        images: body.images || [],
        // PAŽNJA: Frontend mora poslati validan ID korisnika koji je ulogovan!
        userId: body.userId 
      }
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error("Greška pri kreiranju oglasa:", error);
    return NextResponse.json({ error: 'Neuspešno kreiranje' }, { status: 500 });
  }
}
