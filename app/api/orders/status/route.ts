import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { orderId, newStatus, username } = await req.json();

    if (!orderId || !newStatus || !username) {
        return NextResponse.json({ error: "Nedostaju potrebni podaci." }, { status: 400 });
    }

    // 1. Preuzmi narudžbinu iz baze
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        seller: true,
        service: true // Uključujemo i servis da bismo dobili naziv oglasa
      }
    });

    if (!order) {
        return NextResponse.json({ error: "Narudžbina nije pronađena." }, { status: 404 });
    }

    // 2. Pronađi korisnika koji šalje zahtev
    const requestUser = await prisma.user.findUnique({
        where: { username: username }
    });

    if (!requestUser) {
        return NextResponse.json({ error: "Korisnik nije validan." }, { status: 401 });
    }

    // 3. Provera autorizacije
    const isBuyer = order.buyer.username === username;
    const isSeller = order.seller.username === username;
    const isAdmin = requestUser.role === "admin"; // Ispravljeno prema tvojoj šemi (role: "admin")

    if (!isBuyer && !isSeller && !isAdmin) {
        return NextResponse.json({ error: "Nemate dozvolu da menjate status ove narudžbine!" }, { status: 403 });
    }

    // 4. Ažuriramo status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    });

    // --- 5. NOTIFIKACIJE ZA SPOR ---
    if (newStatus === "disputed") {
      try {
        const serviceTitle = order.service.title;

        // A. Notifikacija za PRODAVCA
        await prisma.notification.create({
          data: {
            userId: order.seller.id,
            type: "dispute",
            message: `⚠️ Kupac ${order.buyer.username} je otvorio spor za tvoj oglas: "${serviceTitle}".`,
            link: "/profile" 
          }
        });

        // B. Notifikacije za ADMINA
        const admins = await prisma.user.findMany({
          where: { role: "admin" } // Ispravljeno prema tvojoj šemi
        });

        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: "admin_dispute",
              message: `🚨 NOVI SPOR: Kupac ${order.buyer.username} vs Prodavac ${order.seller.username} za "${serviceTitle}".`,
              link: "/admin"
            }
          });
        }
        
      } catch (notifError) {
        console.error("Greška pri slanju notifikacija:", notifError);
      }
    }
    // ------------------------------------------

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Greška pri promeni statusa:", error);
    return NextResponse.json({ error: "Greška pri promeni statusa" }, { status: 500 });
  }
}
