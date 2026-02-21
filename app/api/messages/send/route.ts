import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // ✅ DODATO: Prihvatamo fileUrl i fileName iz frontend zahteva
    const { content, senderUsername, receiverUsername, fileUrl, fileName } = body;

    if (!content || !senderUsername || !receiverUsername) {
      return NextResponse.json({ error: 'Nedostaju podaci.' }, { status: 400 });
    }

    const sender = await prisma.user.findUnique({ where: { username: senderUsername } });
    const receiver = await prisma.user.findUnique({ where: { username: receiverUsername } });

    if (!sender || !receiver) {
      return NextResponse.json({ error: 'Korisnik nije pronađen.' }, { status: 404 });
    }

    // 1. Snimanje poruke u bazu da ne nestane
    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId: sender.id,
        receiverId: receiver.id,
        isRead: false,
        fileUrl,   // ✅ DODATO: Čuvamo fajl u bazi
        fileName   // ✅ DODATO: Čuvamo ime fajla u bazi
      }
    });

    // 2. Kreiranje notifikacije koja pali CRVENI KRUŽIĆ na zvoncu 🔔
    try {
        await prisma.notification.create({
            data: {
                userId: receiver.id,
                type: 'message',
                message: `📩 Nova poruka od ${senderUsername}`,
                link: `/messages`,
                isRead: false
            }
        });
    } catch (notifError) {
        console.error("Greška kod notifikacije:", notifError);
    }

    return NextResponse.json({ success: true, message: newMessage });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}