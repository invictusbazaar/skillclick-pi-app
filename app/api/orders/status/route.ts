import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Dodali smo 'username' koji ćemo slati sa frontenda
    const { orderId, newStatus, username } = await req.json();

    if (!orderId || !newStatus || !username) {
        return NextResponse.json({ error: "Nedostaju potrebni podaci." }, { status: 400 });
    }

    // 1. Preuzmi narudžbinu iz baze i uključi podatke o kupcu i prodavcu
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        seller: true
      }
    });

    if (!order) {
        return NextResponse.json({ error: "Narudžbina nije pronađena." }, { status: 404 });
    }

    // 2. Pronađi korisnika koji šalje zahtev kako bismo proverili njegove privilegije
    const requestUser = await prisma.user.findUnique({
        where: { username: username }
    });

    if (!requestUser) {
        return NextResponse.json({ error: "Korisnik nije validan." }, { status: 401 });
    }

    // 3. Provera autorizacije: Da li je korisnik kupac, prodavac ili admin?
    const isBuyer = order.buyer.username === username;
    const isSeller = order.seller.username === username;
    const isAdmin = requestUser.isAdmin === true;

    // Ako korisnik nije ni kupac, ni prodavac, ni admin, odbijamo zahtev!
    if (!isBuyer && !isSeller && !isAdmin) {
        return NextResponse.json({ error: "Nemate dozvolu da menjate status ove narudžbine!" }, { status: 403 });
    }

    // 4. Ako je autorizacija uspešna, ažuriramo status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Greška pri promeni statusa:", error);
    return NextResponse.json({ error: "Greška pri promeni statusa" }, { status: 500 });
  }
}
