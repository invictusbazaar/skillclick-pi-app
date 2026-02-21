import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

// GET: Daj mi sve notifikacije za ulogovanog korisnika
export async function POST(req: Request) { 
  try {
    const { username } = await req.json(); // Šaljemo username sa frontenda

    if (!username) return NextResponse.json({ error: "No user" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10 // Poslednjih 10
    });

    // Broj nepročitanih
    const unreadCount = await prisma.notification.count({
        where: { userId: user.id, isRead: false }
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching notifications" }, { status: 500 });
  }
}

// PUT: Označi kao pročitano
export async function PUT(req: Request) {
    try {
        const { notificationId } = await req.json();
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Error updating" }, { status: 500 });
    }
}