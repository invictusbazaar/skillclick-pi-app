import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId, txid, serviceId } = body;

    console.log("🏁 COMPLETE ruta pogođena!", { paymentId, txid });

    if (!paymentId || !txid) {
        return NextResponse.json({ error: "Fale podaci" }, { status: 400 });
    }

    // 1. Javljamo Pi Networku da je gotovo (Complete)
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid })
    });

    if (!response.ok) {
        console.error("❌ Pi Complete Failed:", await response.text());
        // Ne prekidamo ovde, jer želimo da probamo da sačuvamo u bazu ako je txid validan
    }

    // 2. Upisujemo u bazu (Order)
    // Ovde nam treba buyerId. U pravoj app bi ga čitao iz sesije.
    // Za sada ćemo naći servis da povežemo prodavca.
    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { seller: true }
    });

    if (service) {
        console.log("📦 Kreiram porudžbinu u bazi...");
        await prisma.order.create({
            data: {
                paymentId,
                txid,
                amount: service.price,
                status: 'paid',
                serviceId: service.id,
                sellerId: service.seller.id,
                // PAŽNJA: Ovde privremeno stavljamo prodavca i kao kupca ako nemamo info o kupcu
                // Kasnije ćemo ovo srediti da uzima pravog ulogovanog kupca
                buyerId: service.seller.id 
            }
        });
    }

    return NextResponse.json({ message: "Order Completed" });

  } catch (error: any) {
    console.error("🔥 Greška u complete:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}