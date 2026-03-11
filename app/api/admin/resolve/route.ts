import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache"; 

// OBAVEZNO: Sprečava da aplikacija zapamti "zaglavljeno" stanje
export const dynamic = 'force-dynamic';

var StellarSdk = require('stellar-sdk');
const PI_HORIZON_URL = "https://api.testnet.minepi.com";

export async function POST(req: Request) {
  try {
    const { orderId, actionType } = await req.json();

    console.log(`⚖️ ADMIN REŠAVANJE SPORA: Akcija ${actionType} za ORDER: ${orderId}`);

    // 1. Dohvatamo order sa podacima o kupcu, prodavcu i usluzi
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { buyer: true, seller: true, service: true }
    });

    if (!order) return NextResponse.json({ error: "Porudžbina ne postoji!" }, { status: 404 });
    if (order.status === "completed" || order.status === "refunded") {
        return NextResponse.json({ error: "Ova porudžbina je već rešena!" }, { status: 400 });
    }

    // Dodata sigurnosna provera za oba nova statusa spora
    const validStatuses = ["pending", "disputed", "disputed_buyer", "disputed_seller"];
    if (!validStatuses.includes(order.status)) {
         return NextResponse.json({ error: "Porudžbina nije u statusu za rešavanje!" }, { status: 400 });
    }

    // 2. Logika za Refund ili Release
    let destinationWallet = "";
    let payoutAmount = "";
    let newStatus = "";

    if (actionType === "refund") {
        if (!order.buyer.piWallet || !order.buyer.piWallet.startsWith('G')) {
            return NextResponse.json({ error: "Kupac nema validan Pi novčanik u bazi!" }, { status: 400 });
        }
        destinationWallet = order.buyer.piWallet;
        payoutAmount = order.amount.toFixed(7); // Vraćamo 100% kupcu
        newStatus = "refunded";
    } else if (actionType === "release") {
        if (!order.seller.piWallet || !order.seller.piWallet.startsWith('G')) {
            return NextResponse.json({ error: "Prodavac nema validan Pi novčanik u bazi!" }, { status: 400 });
        }
        destinationWallet = order.seller.piWallet;
        payoutAmount = (order.amount * 0.95).toFixed(7); // Dajemo 95% prodavcu
        newStatus = "completed";
    } else {
        return NextResponse.json({ error: "Nepoznata akcija!" }, { status: 400 });
    }

    // 3. PRIPREMA TRANSAKCIJE
    const secretKey = process.env.PI_WALLET_SECRET;
    if (!secretKey) return NextResponse.json({ error: "Fali S-Key u .env fajlu!" }, { status: 500 });

    const server = new StellarSdk.Server(PI_HORIZON_URL);
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const account = await server.loadAccount(sourceKeypair.publicKey());
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: 100000, // 0.01 Pi
        networkPassphrase: "Pi Testnet" 
    })
    .addOperation(StellarSdk.Operation.payment({
        destination: destinationWallet,
        asset: StellarSdk.Asset.native(),
        amount: payoutAmount,
    }))
    .setTimeout(30)
    .build();

    transaction.sign(sourceKeypair);

    console.log(`🚀 Šaljem transakciju na Blockchain (${actionType})...`);
    const result = await server.submitTransaction(transaction);
    console.log("✅ ISPLATA USPEŠNA! Hash:", result.hash);

    // 4. AŽURIRANJE BAZE
    await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus }
    });

    // 5. SLANJE OBAVEŠTENJA KORISNICIMA O PRESUDI
    try {
        const serviceTitle = typeof order.service?.title === 'string' ? order.service.title : (order.service?.title as any)?.sr || "uslugu";
        
        if (actionType === "refund") {
            await prisma.notification.create({
                data: { userId: order.buyer.id, type: "admin_resolved", message: `⚖️ Admin je presudio u tvoju korist za "${serviceTitle}". Novac (${order.amount} Pi) ti je vraćen.`, link: "/profile" }
            });
            await prisma.notification.create({
                data: { userId: order.seller.id, type: "admin_resolved", message: `⚖️ Admin je presudio u korist kupca za "${serviceTitle}". Sredstva su vraćena kupcu.`, link: "/profile" }
            });
        } else if (actionType === "release") {
            await prisma.notification.create({
                data: { userId: order.seller.id, type: "admin_resolved", message: `⚖️ Admin je presudio u tvoju korist za "${serviceTitle}". Zarada ti je uspešno isplaćena!`, link: "/profile" }
            });
            await prisma.notification.create({
                data: { userId: order.buyer.id, type: "admin_resolved", message: `⚖️ Admin je presudio u korist prodavca za "${serviceTitle}". Sredstva su mu prebačena.`, link: "/profile" }
            });
        }
    } catch (notifErr) {
        console.error("Greška pri slanju notifikacija:", notifErr);
    }

    // OBAVEZNO: Potpuno osvežavanje svih ruta kako bi aplikacija shvatila da je transakcija gotova
    revalidatePath("/admin"); 
    revalidatePath("/profile"); 
    revalidatePath("/", "layout"); 

    return NextResponse.json({ success: true, txHash: result.hash, status: newStatus });

  } catch (error: any) {
    console.error("❌ Greška pri rešavanju spora:", error);
    let errorMsg = error.message;
    if (error.response?.data?.extras?.result_codes) {
        errorMsg = `Blockchain Greška: ${error.response.data.extras.result_codes.transaction}`; 
    }
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
