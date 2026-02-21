import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

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
        seller: true
      }
    });

    if (!order) {
        return NextResponse.json({ error: "Narudžbina nije pronađena." }, { status: 404 });
    }

    const requestUser = await prisma.user.findUnique({
        where: { username: username }
    });

    if (!requestUser) {
        return NextResponse.json({ error: "Korisnik nije validan." }, { status: 401 });
    }

    const isBuyer = order.buyer.username === username;
    const isSeller = order.seller.username === username;
    const isAdmin = requestUser.isAdmin === true;

    if (!isBuyer && !isSeller && !isAdmin) {
        return NextResponse.json({ error: "Nemate dozvolu da menjate status ove narudžbine!" }, { status: 403 });
    }

    // --- OSLOBAĐANJE PI TRANSAKCIJE ---
    // Proveravamo da li se status menja u refundiran ili otkazan
    if (newStatus === "refunded" || newStatus === "REFUNDED" || newStatus === "canceled" || newStatus === "CANCELED") {
      const piTxId = order.paymentId;

      if (piTxId) {
        try {
          await axios.post(
            `https://api.minepi.com/v2/payments/${piTxId}/cancel`,
            {},
            {
              headers: {
                Authorization: `Key ${process.env.PI_API_KEY}`,
              },
            }
          );
          console.log(`Pi transakcija ${piTxId} je uspešno otkazana na Pi serveru.`);
        } catch (piError: any) {
          console.error("Greška pri otkazivanju Pi transakcije:", piError.response?.data || piError.message);
        }
      }
    }

    // --- Ažuriramo status u bazi ---
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
