import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache"; 

var StellarSdk = require('stellar-sdk');
const PI_HORIZON_URL = "https://api.testnet.minepi.com";
const PI_API_URL = "https://api.minepi.com/v2";

export async function POST(req: Request) {
  try {
    const { orderId, actionType } = await req.json();

    console.log(`⚖️ ADMIN REŠAVANJE SPORA: Akcija ${actionType} za ORDER: ${orderId}`);

    // 1. Dohvatanje porudžbine sa podacima o kupcu, prodavcu i usluzi
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { buyer: true, seller: true, service: true }
    });

    if (!order) return NextResponse.json({ error: "Porudžbina ne postoji!" }, { status: 404 });
    
    // Provera da li je već rešena
    if (order.status === "completed" || order.status === "refunded") {
        return NextResponse.json({ error: "Ova porudžbina je već rešena!" }, { status: 400 });
    }

    // Validacija statusa za rešavanje spora
    const validStatuses = ["pending", "disputed", "disputed_buyer", "disputed_seller"];
    if (!validStatuses.includes(order.status)) {
         return NextResponse.json({ error: "Status porudžbine nije validan za rešavanje." }, { status: 400 });
    }

    // 2. Priprema parametara za isplatu/refundaciju
    const secretKey = process.env.PI_WALLET_SECRET;
    const piApiKey = process.env.PI_API_KEY;
    
    // Određivanje novčanika i novog statusa na osnovu akcije admina
    const destinationWallet = actionType === "refund" ? order.buyer.piWallet : order.seller.piWallet;
    const newStatus = actionType === "refund" ? "refunded" : "completed";
    
    if (!destinationWallet) {
        return NextResponse.json({ error: "Primalac nema podešen novčanik!" }, { status: 400 });
    }

    // 3. Blockchain transakcija (Stellar SDK)
    const server = new StellarSdk.Server(PI_HORIZON_URL);
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const account = await server.loadAccount(sourceKeypair.publicKey());
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: 100000, 
        networkPassphrase: "Pi Testnet" 
    })
    .addOperation(StellarSdk.Operation.payment({
        destination: destinationWallet,
        asset: StellarSdk.Asset.native(),
        amount: order.amount.toString(), 
    }))
    .setTimeout(30)
    .build();

    transaction.sign(sourceKeypair);
    const result = await server.submitTransaction(transaction);
    console.log(`✅ Blockchain potvrda (Hash): ${result.hash}`);

    // 4. 🔥 SINHRONIZACIJA SA PI MREŽOM (Rešava "Pending Payment" bug)
    // Ovaj deo javlja Pi serveru da je transakcija definitivno zatvorena
    if (order.paymentId) {
        try {
            const piAction = actionType === 'refund' ? 'cancel' : 'complete';
            const piBody = actionType === 'release' ? { txid: result.hash } : {};

            const piResponse = await fetch(`${PI_API_URL}/payments/${order.paymentId}/${piAction}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Key ${piApiKey}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(piBody)
            });

            if (piResponse.ok) {
                console.log(`✅ Pi API: Payment ${order.paymentId} uspešno označen kao ${piAction}.`);
            } else {
                const errText = await piResponse.text();
                console.error("⚠️ Pi API upozorenje:", errText);
            }
        } catch (apiErr) {
            console.error("❌ Greška pri komunikaciji sa Pi API serverom:", apiErr);
        }
    }

    // 5. Ažuriranje baze podataka
    await prisma.order.update({
        where: { id: orderId },
        data: { 
            status: newStatus,
            txid: result.hash
        }
    });

    // 6. Slanje notifikacija korisnicima
    const serviceTitle = order.service.title;
    try {
        if (actionType === "refund") {
            await prisma.notification.create({
                data: { userId: order.buyer.id, type: "admin_resolved", message: `⚖️ Admin je presudio u tvoju korist za "${serviceTitle}". Novac ti je vraćen.`, link: "/profile" }
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

    revalidatePath("/admin"); 

    return NextResponse.json({ success: true, txHash: result.hash, status: newStatus });

  } catch (error: any) {
    console.error("❌ Greška pri rešavanju spora:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
