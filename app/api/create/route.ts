import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export async function POST(request: Request) {
  try {
    console.log("🚀 POČINJEM KREIRANJE OGLASA..."); // Ovo ćemo tražiti u logovima

    const body = await request.json();
    console.log("📥 Primljeni podaci:", body); // Da vidimo šta telefon šalje

    const { title, description, category, price, deliveryTime, revisions, author, images } = body;

    // Provera da li fale podaci
    if (!title || !price || !author) {
        console.error("❌ Fale podaci!");
        return NextResponse.json({ error: "Fale obavezni podaci" }, { status: 400 });
    }

    // 1. Nađi ili napravi korisnika
    let user = await prisma.user.findUnique({
      where: { username: author }
    });

    if (!user) {
      console.log("👤 Korisnik ne postoji, kreiram novog:", author);
      user = await prisma.user.create({
        data: { 
            username: author,
            role: author === 'Ilija1969' ? 'admin' : 'user'
        }
      });
    }

    // 2. Upisivanje oglasa
    console.log("📝 Upisujem oglas u bazu...");
    const newService = await prisma.service.create({
      data: {
        title,
        description,
        category,
        price: parseFloat(price),
        images: images || [],
        userId: user.id, // Povezujemo preko ID-a korisnika
      },
    });

    console.log("✅ Oglas uspešno kreiran:", newService.id);
    return NextResponse.json({ success: true, service: newService });

  } catch (error: any) {
    console.error("🔥 FATALNA GREŠKA NA SERVERU:", error);
    // Vraćamo tačan opis greške nazad na telefon da znaš šta je
    return NextResponse.json({ error: error.message || "Greška na serveru" }, { status: 500 });
  }

}