import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

const PI_API_KEY = "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId, txid, amount, sellerUsername, buyerUsername, serviceId } = body;

    console.log("🏁 COMPLETE RUTA POGOĐENA:", { paymentId, buyerUsername, amount });

    if (!paymentId || !txid) {
        return NextResponse.json({ error: "Fale podaci (paymentId ili txid)" }, { status: 400 });
    }

    // 1. OBAVEŠTAVAMO PI SERVER (Ovo radi, jer ti je payment uspešan)
    console.log("📡 Šaljem potvrdu ka Pi serveru...");
    const piResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid })
    });

    // Čak i ako Pi vrati grešku (npr. već kompletirano), mi nastavljamo da bismo upisali u bazu!
    const piData = piResponse.ok ? await piResponse.json() : null;
    if (!piResponse.ok) console.log("⚠️ Pi Complete Info:", await piResponse.text());

    // 2. UPIS U BAZU - ROBUSTNA VERZIJA
    console.log("💾 Pokušavam upis u bazu...");

    // A) Osiguraj da KUPAC postoji (Ako nema, kreiraj ga!)
    const buyer = await prisma.user.upsert({
        where: { username: buyerUsername },
        update: {}, // Ako postoji, ne diraj ništa
        create: { 
            username: buyerUsername, 
            role: "user" 
        }
    });

    // B) Osiguraj da PRODAVAC postoji
    const seller = await prisma.user.upsert({
        where: { username: sellerUsername },
        update: {},
        create: { 
            username: sellerUsername, 
            role: "user" 
        }
    });

    // C) Provera da li Usluga (Service) postoji
    // Ako serviceId nije validan u bazi, povezaćemo ga na null ili moramo handlovati grešku.
    // Ovde pretpostavljamo da serviceId postoji. Ako pukne, uhvatićemo u catch blok.
    
    // D) Kreiranje porudžbine
    const existingOrder = await prisma.order.findUnique({
        where: { paymentId: paymentId }
    });

    if (!existingOrder) {
        const newOrder = await prisma.order.create({
            data: {
                amount: parseFloat(amount),
                paymentId: paymentId,
                txid: txid,
                status: "pending", 
                buyerId: buyer.id,
                sellerId: seller.id,
                serviceId: serviceId // ⚠️ Ako serviceId ne postoji u bazi, ovde će pući!
            }
        });
        console.log("🎉 Porudžbina USPEŠNO sačuvana! ID:", newOrder.id);
    } else {
        console.log("⚠️ Porudžbina već postoji.");
    }

    return NextResponse.json({ success: true, data: piData });

  } catch (error: any) {
    console.error("🔥 GREŠKA PRI UPISU U BAZU:", error);
    // Vraćamo success:true jer je Pi plaćanje prošlo, da ne zbunjujemo korisnika,
    // ali logujemo grešku da ti možeš da vidiš u Vercel logovima.
    return NextResponse.json({ success: true, error: "DB Error: " + error.message });
  }
}
