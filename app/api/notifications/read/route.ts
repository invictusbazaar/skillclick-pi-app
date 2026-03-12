import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// Koristimo isključivo POST jer mobilne mreže garantovano propuštaju POST zahteve
export async function POST(req: Request) {
    try {
        const { notificationId } = await req.json();
        
        if (!notificationId) {
            return NextResponse.json({ error: "Nedostaje ID notifikacije" }, { status: 400 });
        }

        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Greška pri ažuriranju notifikacije u bazi:", error);
        return NextResponse.json({ error: "Error updating DB" }, { status: 500 });
    }
}