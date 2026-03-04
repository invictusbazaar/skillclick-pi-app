import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache"; 

// Koristimo Stellar SDK za Pi Network transakcije
var StellarSdk = require('stellar-sdk');

const PI_HORIZON_URL = "https://api.testnet.minepi.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Ne verujemo 'amount' sa frontenda, uzimamo samo ID i Wallet
    const { sellerWalletAddress, orderId } = body;

    console.log("💸 POKUŠAJ ISPLATE ZA ORDER:", orderId);

    // 1. SIGURNOSNA PROVERA: Da li porudžbina postoji?
    const existingOrder = await prisma.order.findUnique({
        where: { id: orderId }
    });

    if (!existingOrder) {
        return NextResponse.json({ error: "Porudžbina ne postoji!" }, { status: 404 });
    }

    // 2. PROVERA STATUSA
    if (existingOrder.status === "completed") {
        console.log("🛑 STOP: Pokušaj duple isplate!");
        return NextResponse.json({ error: "Ova porudžbina je već isplaćena!" }, { status: 400 });
    }

    // 3. MATEMATIKA: 5% PROVIZIJA (Računamo na osnovu cene iz BAZE, ne sa frontenda)
    const realAmount = existingOrder.amount; 
    const payoutAmount = (realAmount * 0.95).toFixed(7); // 95% prodavcu
    const feeAmount = (realAmount * 0.05).toFixed(7);   // 5% ostaje tebi

    console.log(`💰 Ukupno: ${realAmount} | Prodavcu: ${payoutAmount} | Tebi ostaje: ${feeAmount}`);

    // 4. PRIPREMA TRANSAKCIJE
    const secretKey = process.env.PI_WALLET_SECRET;
    if (!secretKey) return NextResponse.json({ error: "Fali S-Key u .env fajlu!" }, { status: 500 });

    const server = new StellarSdk.Server(PI_HORIZON_URL);
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const account = await server.loadAccount(sourceKeypair.publicKey());
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: 100000, // 0.01 Pi (standardni fee mreže)
        networkPassphrase: "Pi Testnet" 
    })
    .addOperation(StellarSdk.Operation.payment({
        destination: sellerWalletAddress,
        asset: StellarSdk.Asset.native(),
        amount: payoutAmount, // Šaljemo samo 95%
    }))
    .setTimeout(30)
    .build();

    transaction.sign(sourceKeypair);

    console.log("🚀 Šaljem transakciju na Blockchain...");
    const result = await server.submitTransaction(transaction);
    console.log("✅ ISPLATA USPEŠNA! Hash:", result.hash);

    // 5. AŽURIRANJE BAZE
    await prisma.order.update({
        where: { id: orderId },
        data: { status: "completed" }
    });

    revalidatePath("/admin"); 

    return NextResponse.json({ 
        success: true, 
        txHash: result.hash, 
        paidAmount: payoutAmount,
        feeKept: feeAmount
    });

  } catch (error: any) {
    console.error("❌ Payout Greška:", error);
    
    let errorMsg = error.message;
    if (error.response && error.response.data) {
        const codes = error.response.data.extras?.result_codes;
        if (codes) {
            errorMsg = `Blockchain Greška: ${codes.transaction}`; 
        } else {
            errorMsg = JSON.stringify(error.response.data);
        }
    }

    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}