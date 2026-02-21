import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Tvoj provereni API ključ
const PI_API_KEY = "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp";

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
        seller: true
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
    const isAdmin = requestUser.isAdmin === true;

    if (!isBuyer && !isSeller && !isAdmin) {
        return NextResponse.json({ error: "Nemate dozvolu da menjate status ove narudžbine!" }, { status: 403 });
    }

    // --- 4. TRAJNO REŠENJE: OSLOBAĐANJE PI TRANSAKCIJE PRI REFUNDACIJI ---
    // Ako se status menja u otkazan ili refundiran, automatski čistimo Pi server
    const cancelStatuses = ["canceled", "CANCELED", "refunded", "REFUNDED"];
    
    if (cancelStatuses.includes(newStatus) && order.paymentId) {
      try {
        // Prvo pokušavamo da otkažemo (Cancel)
        let piResponse = await fetch(`https://api.minepi.com/v2/payments/${order.paymentId}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Key ${PI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        // Ako Pi server odbije otkazivanje jer su sredstva već prošla (txid postoji), 
        // onda moramo da pošaljemo komandu za kompletiranje (Complete) da bi se oslobodilo.
        if (!piResponse.ok && order.txid) {
            piResponse = await fetch(`https://api.minepi.com/v2/payments/${order.paymentId}/complete`, {
                method: 'POST',
                headers: {
                  'Authorization': `Key ${PI_API_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ txid: order.txid })
            });
        }
        
        if (piResponse.ok) {
          console.log(`Pi transakcija ${order.paymentId} uspešno rešena na Pi serveru.`);
        } else {
          console.error("Pi server nije oslobodio transakciju.");
        }
      } catch (piError) {
        console.error("Greška pri komunikaciji sa Pi serverom:", piError);
      }
    }
    // ---------------------------------------------------------------------

    // 5. Ažuriramo status u bazi (ovo je kod tebe već radilo savršeno)
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
