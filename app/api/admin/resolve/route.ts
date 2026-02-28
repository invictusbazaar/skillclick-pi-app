import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache"; 

var StellarSdk = require('stellar-sdk');
const PI_HORIZON_URL = "https://api.testnet.minepi.com";
const PI_API_URL = "https://api.minepi.com/v2";

export async function POST(req: Request) {
  try {
    const { orderId, actionType } = await req.json();
    const piApiKey = process.env.PI_API_KEY;

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
         return NextResponse.json({ error: "Status nije validan za rešavanje!" }, { status: 400 });
    }

    let destinationWallet = actionType === "refund" ? order.buyer.piWallet : order.seller.piWallet;
    let payoutAmount = actionType === "refund" ? order.amount.toFixed(7) : (order.amount * 0.95).toFixed(7);
    let newStatus = actionType === "refund" ? "refunded" : "completed";

    if (!destinationWallet) return NextResponse.json({ error: "Novčanik nije pronađen!" }, { status: 400 });

    // 3. BLOCKCHAIN TRANSAKCIJA
    const secretKey = process.env.PI_WALLET_SECRET;
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
        amount: payoutAmount,
    }))
    .setTimeout(30)
    .build();

    transaction.sign(sourceKeypair);
    const result = await server.submitTransaction(transaction);

    // 🔥 KLJUČ KOJI JE FALIO: Javljanje Pi Mreži da odglavi telefon
    if (order.paymentId && piApiKey) {
        try {
            const piAction = actionType === 'refund' ? 'cancel' : 'complete';
            await fetch(`${PI_API_URL}/payments/${order.paymentId}/${piAction}`, {
                method: 'POST',
                headers: { 'Authorization': `Key ${piApiKey}`, 'Content-Type': 'application/json' },
                body: actionType === 'release' ? JSON.stringify({ txid: result.hash }) : JSON.stringify({})
            });
            console.log(`✅ Pi API: Payment ${piAction}`);
        } catch (apiErr) {
            console.error("Pi API Error:", apiErr);
        }
    }

    await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus, txid: result.hash }
    });

    revalidatePath("/admin"); 
    return NextResponse.json({ success: true, txHash: result.hash, status: newStatus });

  } catch (error: any) {
    console.error("Greška:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
