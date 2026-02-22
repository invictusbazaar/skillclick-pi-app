import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { orderId, newStatus, username } = await req.json();

    if (!orderId || !newStatus || !username) {
        return NextResponse.json({ error: "Nedostaju potrebni podaci." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        seller: true,
        service: true 
      }
    });

    if (!order) return NextResponse.json({ error: "Narudžbina nije pronađena." }, { status: 404 });

    const requestUser = await prisma.user.findUnique({
        where: { username: username }
    });

    if (!requestUser) return NextResponse.json({ error: "Korisnik nije validan." }, { status: 401 });

    const isBuyer = order.buyer.username === username;
    const isSeller = order.seller.username === username;
    // Priznajemo admina čak i ako je na frontendu označen drugačije
    const isAdmin = requestUser.role === "admin" || (requestUser as any).isAdmin === true; 

    if (!isBuyer && !isSeller && !isAdmin) {
        return NextResponse.json({ error: "Nemate dozvolu da menjate status ove narudžbine!" }, { status: 403 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    });

    // --- LOGIKA ZA NOTIFIKACIJE ---
    try {
      const serviceTitle = typeof order.service.title === 'string' 
        ? order.service.title 
        : (order.service.title as any)?.sr || "uslugu";

      // 1. KADA KUPAC POKRENE SPOR
      if (newStatus === "disputed") {
        
        // A. Poruka za KUPCA (Da znaš da je tvoj zahtev prošao!)
        await prisma.notification.create({
          data: {
            userId: order.buyer.id,
            type: "dispute_info",
            message: `✅ Uspešno si otvorio spor za: "${serviceTitle}".`,
            link: "/profile" 
          }
        });

        // B. Poruka za PRODAVCA
        await prisma.notification.create({
          data: {
            userId: order.seller.id,
            type: "dispute",
            message: `⚠️ Kupac ${order.buyer.username} je otvorio spor za: "${serviceTitle}".`,
            link: "/profile" 
          }
        });

        // C. Poruka za ADMINA
        const admins = await prisma.user.findMany({
          where: { role: "admin" } 
        });

        for (const admin of admins) {
          // Nećemo slati duplu poruku ako je admin ujedno i kupac
          if (admin.id !== order.buyer.id) {
             await prisma.notification.create({
               data: {
                 userId: admin.id,
                 type: "admin_dispute",
                 message: `🚨 OTVOREN SPOR: ${order.buyer.username} vs ${order.seller.username} za "${serviceTitle}".`,
                 link: "/admin"
               }
             });
          }
        }
      }

      // 2. KADA KUPAC PONIŠTI SPOR
      if (newStatus === "pending" && isBuyer) {
        await prisma.notification.create({
          data: {
            userId: order.seller.id,
            type: "dispute_resolved",
            message: `✅ Kupac ${order.buyer.username} je poništio spor. Narudžbina je ponovo aktivna.`,
            link: "/profile" 
          }
        });
      }

    } catch (notifError) {
      console.error("Greška pri kreiranju notifikacija:", notifError);
    }
    // ------------------------------------------

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Greška pri promeni statusa:", error);
    return NextResponse.json({ error: "Greška pri promeni statusa" }, { status: 500 });
  }
}
