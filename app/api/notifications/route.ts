import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// GET: Daj mi sve notifikacije za ulogovanog korisnika
export async function POST(req: Request) { 
  try {
    const { username } = await req.json(); 

    if (!username) return NextResponse.json({ error: "No user" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: [
            { isRead: 'asc' }, // HIRURŠKI REZ: Nepročitane (false) UVEK idu na vrh liste!
            { createdAt: 'desc' } // Zatim ih sortiraj po datumu
        ],
        take: 10 
    });

    const unreadCount = await prisma.notification.count({
        where: { userId: user.id, isRead: false }
    });

    const response = NextResponse.json({ notifications, unreadCount });
    
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Error fetching notifications" }, { status: 500 });
  }
}
