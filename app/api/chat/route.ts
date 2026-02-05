import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. DOBIJANJE PORUKA (GET)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const myUsername = searchParams.get('myUsername');
  const otherUsername = searchParams.get('otherUsername');

  if (!myUsername || !otherUsername) {
    return NextResponse.json({ error: 'Missing users' }, { status: 400 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { 
            sender: { username: myUsername }, 
            receiver: { username: otherUsername } 
          },
          { 
            sender: { username: otherUsername }, 
            receiver: { username: myUsername } 
          }
        ]
      },
      orderBy: { createdAt: 'asc' }, // Od najstarije ka najnovijoj
      include: { sender: true }
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 });
  }
}

// 2. SLANJE PORUKE (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, senderUsername, receiverUsername } = body;

    if (!content || !senderUsername || !receiverUsername) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Moramo naći ID-eve korisnika na osnovu username-a
    const sender = await prisma.user.findUnique({ where: { username: senderUsername } });
    const receiver = await prisma.user.findUnique({ where: { username: receiverUsername } });

    if (!sender || !receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId: sender.id,
        receiverId: receiver.id,
        isRead: false
      }
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error sending message' }, { status: 500 });
  }
}