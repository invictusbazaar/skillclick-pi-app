import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Stari dobri require koji uvek radi sa v10
var StellarSdk = require('stellar-sdk');

const PI_HORIZON_URL = "https://api.testnet.minepi.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, sellerWalletAddress, orderId } = body;

    console.log("💸 Payout Start (v10.4.1):", { amount, sellerWalletAddress });

    const secretKey = process.env.PI_WALLET_SECRET;
    if (!secretKey) return NextResponse.json({ error: "No Secret Key" }, { status: 500 });

    // Instanciranje servera (ovo je pravilo problem u v13)
    const server = new StellarSdk.Server(PI_HORIZON_URL);

    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const account = await server.loadAccount(sourceKeypair.publicKey());

    const payoutAmount = (amount * 0.95).toFixed(7); 

    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: "Pi Testnet" // "Pi Network" za Mainnet
    })
    .addOperation(StellarSdk.Operation.payment({
        destination: sellerWalletAddress,
        asset: StellarSdk.Asset.native(),
        amount: payoutAmount,
    }))
    .setTimeout(30)
    .build();

    transaction.sign(sourceKeypair);

    console.log("🚀 Slanje transakcije...");
    const result = await server.submitTransaction(transaction);
    console.log("✅ Uspeh! Hash:", result.hash);

    await prisma.order.update({
        where: { id: orderId },
        data: { status: "completed" }
    });

    return NextResponse.json({ success: true, txHash: result.hash, paidAmount: payoutAmount });

  } catch (error: any) {
    console.error("❌ Payout Error:", error);
    // Siguran ispis greške
    let msg = error.message;
    if(error.response && error.response.data) {
        msg = JSON.stringify(error.response.data);
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
