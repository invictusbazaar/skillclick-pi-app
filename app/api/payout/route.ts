import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Koristimo staru verziju biblioteke (provereno radi)
var StellarSdk = require('stellar-sdk');

const PI_HORIZON_URL = "https://api.testnet.minepi.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, sellerWalletAddress, orderId } = body;

    console.log("💸 POKUŠAJ ISPLATE:", { amount, sellerWalletAddress });

    const secretKey = process.env.PI_WALLET_SECRET;
    if (!secretKey) return NextResponse.json({ error: "Fali S-Key u .env fajlu!" }, { status: 500 });

    const server = new StellarSdk.Server(PI_HORIZON_URL);
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);

    // 1. Učitavanje računa
    const account = await server.loadAccount(sourceKeypair.publicKey());
    
    // Iznos za isplatu (95%)
    const payoutAmount = (amount * 0.95).toFixed(7); 

    // 2. Kreiranje transakcije sa TAČNOM Pi PROVIZIJOM
    const transaction = new StellarSdk.TransactionBuilder(account, {
        // 👇👇👇 GLAVNA ISPRAVKA 👇👇👇
        // Umesto StellarSdk.BASE_FEE, stavljamo fiksno 0.01 Pi (100000 stroopsa)
        fee: 100000, 
        
        networkPassphrase: "Pi Testnet" 
    })
    .addOperation(StellarSdk.Operation.payment({
        destination: sellerWalletAddress,
        asset: StellarSdk.Asset.native(),
        amount: payoutAmount,
    }))
    .setTimeout(30)
    .build();

    transaction.sign(sourceKeypair);

    // 3. Slanje
    console.log("🚀 Šaljem transakciju (Fee: 0.01 Pi)...");
    const result = await server.submitTransaction(transaction);
    console.log("✅ ISPLATA USPEŠNA! Hash:", result.hash);

    await prisma.order.update({
        where: { id: orderId },
        data: { status: "completed" }
    });

    return NextResponse.json({ success: true, txHash: result.hash, paidAmount: payoutAmount });

  } catch (error: any) {
    console.error("❌ Payout Greška:", error);
    
    let errorMsg = error.message;
    if (error.response && error.response.data) {
        const codes = error.response.data.extras?.result_codes;
        if (codes) {
            errorMsg = `GRESKA: ${codes.transaction}`; 
        } else {
            errorMsg = JSON.stringify(error.response.data);
        }
    }

    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
