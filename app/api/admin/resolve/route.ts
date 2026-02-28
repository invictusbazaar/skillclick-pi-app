import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache"; 

var StellarSdk = require('stellar-sdk');
const PI_HORIZON_URL = "https://api.testnet.minepi.com";
const PI_API_URL = "https://api.minepi.com/v2";

export async function POST(req: Request) {
  try {
    const { orderId, actionType } = await req.json();

    console.log(`⚖️ ADMIN REŠAVANJE: Akcija ${actionType} za ORDER: ${orderId}`);

    // 1. Dohvatamo order sa podacima o kupcu, prodavcu i usluzi 
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { buyer: true, seller: true, service: true }
    });

    if (!order) return NextResponse.json({ error: "Porudžbina ne postoji!" }, { status: 404 });
    if (order.status === "completed" || order.status === "refunded") {
        return NextResponse.json({ error: "Ova porudžbina je već rešena!" }, { status: 400 });
    }

    const validStatuses = ["pending", "disputed", "disputed_buyer", "disputed_seller"];
    if (!validStatuses.includes(order.status)) {
         return NextResponse.json({ error: "Status nije validan za rešavanje." }, { status: 400 });
    }

    // 2. Priprema za Stellar i Pi API 
    const secretKey = process.env.PI_WALLET_SECRET;
    const piApiKey = process.env.PI_API_KEY;
    const destinationWallet = actionType === "refund" ? order.buyer.piWallet : order.seller.piWallet;
    const newStatus = actionType === "refund" ? "refunded" : "completed";
    
    if (!destinationWallet) {
        return NextResponse.json({ error: "Primalac nema novčanik!" }, { status: 400 });
    }

    // 3. Blockchain transakcija 
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
    console.log(`✅ Blockchain Hash: ${result.hash}`);

    // 4. 🔥 SIGNAL PI MREŽI (Ovo odglavljuje telefon!) 
    if (order.paymentId) {
        try {
            const piAction = actionType === 'refund' ? 'cancel' : 'complete';
            const piBody = actionType === 'release' ? { txid: result.hash } : {};

            await fetch(`${PI_API_URL}/payments/${order.paymentId}/${piAction}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Key ${piApiKey}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(piBody)
            });
            console.log(`✅ Pi API: Payment ${order.paymentId} je ${piAction}.`);
        } catch (apiErr) {
            console.error("❌ Pi API Error:", apiErr);
        }
    }

    // 5. Ažuriranje baze 
    await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus, txid: result.hash }
    });

    // 6. Notifikacije 
    const serviceTitle = order.service.title;
    const buyerMsg = actionType === "refund" ? `Novac ti je vraćen za "${serviceTitle}".` : `Admin je isplatio prodavca za "${serviceTitle}".`;
    const sellerMsg = actionType === "refund" ? `Sredstva su vraćena kupcu za "${serviceTitle}".` : `Zarada ti je isplaćena za "${serviceTitle}"!`;

    await prisma.notification.create({ data: { userId: order.buyer.id, type: "admin_resolved", message: buyerMsg, link: "/profile" } });
    await prisma.notification.create({ data: { userId: order.seller.id, type: "admin_resolved", message: sellerMsg, link: "/profile" } });

    revalidatePath("/admin"); 
    return NextResponse.json({ success: true, txHash: result.hash, status: newStatus });

  } catch (error: any) {
    console.error("❌ Greška:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
