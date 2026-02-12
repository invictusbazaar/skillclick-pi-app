import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { myUsername, otherUsername } = body;

    // Provera da li su podaci stigli
    if (!myUsername || !otherUsername) {
        return NextResponse.json({ messages: [] });
    }

    const me = await prisma.user.findUnique({ where: { username: myUsername } });
    const other = await prisma.user.findUnique({ where: { username: otherUsername } });

    if (!me || !other) {
        return NextResponse.json({ messages: [] });
    }

    // Uzimamo SVE poruke između vas dvoje (bez obzira na oglas)
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: me.id, receiverId: other.id },
          { senderId: other.id, receiverId: me.id }
        ]
      },
      orderBy: { createdAt: 'asc' }, // Poređano hronološki
      include: {
        sender: true
      }
    });

    // Označimo poruke kao pročitane čim ih učitamo
    await prisma.message.updateMany({
      where: {
        senderId: other.id,
        receiverId: me.id,
        isRead: false
      },
      data: { isRead: true }
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Greška u API get:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}