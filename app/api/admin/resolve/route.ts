import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache"; 

var StellarSdk = require('stellar-sdk');

// ✅ VRAĆENO NA TESTNET: Koristi se isključivo za testne novčiće
const PI_HORIZON_URL = "https://api.testnet.minepi.com";

export async function POST(req: Request) {
  try {
    const { orderId, actionType } = await req.json();

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { buyer: true, seller: true }
    });

    if (!order) return NextResponse.json({ error: "Porudžbina ne postoji!" }, { status: 404 });
    
    let destinationWallet = "";
    let payoutAmount = "";
    let newStatus = "";

    if (actionType === "refund") {
        destinationWallet = order.buyer.piWallet || "";
        payoutAmount = order.amount.toFixed(7);
        newStatus = "refunded";
    } else {
        destinationWallet = order.seller.piWallet || "";
        payoutAmount = (order.amount * 0.95).toFixed(7);
        newStatus = "completed";
    }

    if (!destinationWallet.startsWith('G')) {
        return NextResponse.json({ error: "Nevalidna adresa novčanika!" }, { status: 400 });
    }

    const secretKey = process.env.PI_WALLET_SECRET;
    const server = new StellarSdk.Server(PI_HORIZON_URL);
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const account = await server.loadAccount(sourceKeypair.publicKey());
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: 100000, 
        // ✅ OBAVEZNO ZA TESTNET:
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

    await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus }
    });

    revalidatePath("/admin"); 
    return NextResponse.json({ success: true, txHash: result.hash, status: newStatus });

  } catch (error: any) {
    console.error("❌ Greška:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
