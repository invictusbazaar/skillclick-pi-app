import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();
    
    // Provera da li je stiglo korisničko ime
    if (!username) {
      return NextResponse.json({ error: 'Nema korisničkog imena' }, { status: 400 });
    }

    // Ažuriramo vreme "lastSeen" na TRENUTNO vreme
    await prisma.user.update({
      where: { username },
      data: { lastSeen: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Greška pri ažuriranju prisustva:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}