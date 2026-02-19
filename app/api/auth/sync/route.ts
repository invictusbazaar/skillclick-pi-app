import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // ✅ Sada hvatamo i 'uid' iz tela zahteva
    const { username, uid } = body;

    if (!username) {
      return NextResponse.json({ error: 'Nedostaje username.' }, { status: 400 });
    }

    // Prisma upsert: Ako korisnik postoji, ažuriraj mu piUid (ako je poslat).
    // Ako NE postoji, kreiraj mu profil sa username i piUid!
    const user = await prisma.user.upsert({
      where: { username: username },
      update: {
        ...(uid && { piUid: uid }) // Ažuriraj piUid samo ako je prosleđen
      }, 
      create: {
        username: username,
        ...(uid && { piUid: uid }) // Postavi piUid pri kreiranju novog korisnika
      }
    });

    return NextResponse.json({ success: true, user });

  } catch (error: any) {
    console.error("Greška pri tihoj registraciji:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}