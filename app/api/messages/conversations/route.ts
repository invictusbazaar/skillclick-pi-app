import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Pronalazimo sve poruke
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Grupišemo poruke po razgovorima
    const conversationsMap = new Map();

    messages.forEach((msg) => {
      const otherUser = msg.senderId === user.id ? msg.receiver : msg.sender;
      
      if (!conversationsMap.has(otherUser.username)) {
        conversationsMap.set(otherUser.username, {
          username: otherUser.username,
          lastMessage: msg.content,
          time: msg.createdAt,
          isRead: msg.receiverId === user.id ? msg.isRead : true,
          // 👇 OVO JE NOVO: Šaljemo vreme kada je korisnik poslednji put viđen
          lastSeen: otherUser.lastSeen 
        });
      }
    });

    return NextResponse.json({ conversations: Array.from(conversationsMap.values()) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
