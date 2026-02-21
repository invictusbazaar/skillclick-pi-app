import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { messageId, username } = body;

    if (!messageId || !username) {
      return NextResponse.json({ error: 'Nedostaju podaci za brisanje.' }, { status: 400 });
    }

    // 1. Nalazimo poruku i proveravamo ko ju je poslao
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { sender: true }
    });

    if (!message) {
      return NextResponse.json({ error: 'Poruka nije pronađena.' }, { status: 404 });
    }

    // 2. Sigurnosna provera: Samo pošiljalac može da obriše svoju poruku
    if (message.sender.username !== username) {
      return NextResponse.json({ error: 'Nemate dozvolu da obrišete ovu poruku.' }, { status: 403 });
    }

    // 3. Brisanje poruke iz baze
    await prisma.message.delete({
      where: { id: messageId }
    });

    return NextResponse.json({ success: true, message: 'Poruka uspešno obrisana.' });

  } catch (error: any) {
    console.error("Greška pri brisanju poruke:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}