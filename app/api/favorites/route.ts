import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Dohvatanje svih omiljenih oglasa (sada tražimo preko username-a)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Nedostaje username" }, { status: 400 });
  }

  try {
    // Prvo nađemo korisnika po username-u da bismo dobili njegov pravi ID iz baze
    const dbUser = await prisma.user.findUnique({ where: { username } });
    
    if (!dbUser) {
      return NextResponse.json([], { status: 200 }); // Ako nema korisnika, vraća prazan niz
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: dbUser.id },
      include: { 
        service: {
          include: {
            seller: true // ✅ DODATO: Učitavamo i podatke o prodavcu (avatar i username)
          }
        } 
      }, 
    });

    return NextResponse.json(favorites, { status: 200 });
  } catch (error) {
    console.error("Greška pri učitavanju omiljenih oglasa:", error);
    return NextResponse.json({ error: "Greška pri učitavanju omiljenih oglasa" }, { status: 500 });
  }
}

// POST: Dodavanje ili brisanje iz omiljenih
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, serviceId } = body;

    if (!username || !serviceId) {
      return NextResponse.json({ error: "Nedostaju username ili serviceId" }, { status: 400 });
    }

    // Nalazimo korisnikov pravi ID u bazi
    const dbUser = await prisma.user.findUnique({ where: { username } });
    
    if (!dbUser) {
      return NextResponse.json({ error: "Korisnik nije pronađen u bazi" }, { status: 404 });
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_serviceId: {
          userId: dbUser.id,
          serviceId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });
      return NextResponse.json({ message: "Uklonjeno iz omiljenih" }, { status: 200 });
    } else {
      const newFavorite = await prisma.favorite.create({
        data: {
          userId: dbUser.id,
          serviceId,
        },
      });
      return NextResponse.json(newFavorite, { status: 201 });
    }
  } catch (error) {
    console.error("Greška pri dodavanju u omiljene:", error);
    return NextResponse.json({ error: "Greška pri obradi zahteva" }, { status: 500 });
  }
}