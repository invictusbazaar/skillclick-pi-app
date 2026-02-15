import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ error: 'Nedostaje username.' }, { status: 400 });
    }

    // Prisma upsert: Ako korisnik postoji u bazi, ne diraj ništa.
    // Ako NE postoji, odmah mu kreiraj prazan profil!
    const user = await prisma.user.upsert({
      where: { username: username },
      update: {}, 
      create: {
        username: username
      }
    });

    return NextResponse.json({ success: true, user });

  } catch (error: any) {
    console.error("Greška pri tihoj registraciji:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}