import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export async function POST(request: Request) {
  try {
    const { paymentId, txid, serviceId } = await request.json();

    // 1. Javljamo Pi serveru da je gotovo
    const piRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });

    if (!piRes.ok) throw new Error('Pi Complete Error');
    const paymentData = await piRes.json();
    const buyerPiUsername = paymentData.user_uid; // Pi vraća ID korisnika

    // 2. Pronađi uslugu i prodavca
    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { seller: true } // U tvojoj šemi veza se zove "seller" (User model)
    });

    if (!service) throw new Error("Usluga nije pronađena");

    // 3. Pronađi ili kreiraj kupca u našoj bazi
    // (Pošto Pi vraća UID, ovde ćemo privremeno koristiti placeholder ako nemamo pravi username mapping)
    let buyer = await prisma.user.findFirst({
        where: { username: buyerPiUsername } 
    });
    
    // Ako kupac ne postoji u našoj bazi, kreiramo ga
    if (!buyer) {
        buyer = await prisma.user.create({
            data: { username: buyerPiUsername }
        });
    }

    // 4. Kreiraj porudžbinu (Sada se poklapa sa tvojom šemom)
    await prisma.order.create({
        data: {
            status: 'COMPLETED',
            amount: parseFloat(paymentData.amount),
            paymentId: paymentId,
            txid: txid,
            buyerId: buyer.id,    // Povezujemo sa kupcem
            sellerId: service.userId, // Povezujemo sa prodavcem (preko service.userId)
            serviceId: service.id
        }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Greška:", error);
    return NextResponse.json({ error: "Greška" }, { status: 500 });
  }
}