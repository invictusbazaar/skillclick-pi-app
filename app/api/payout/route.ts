import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 👇 PROMENA: Koristimo 'require' da nasilno učitamo celu biblioteku
// Ovo zaobilazi problem sa importima koji prave grešku "not a constructor"
const StellarSdk = require("stellar-sdk");

const PI_HORIZON_URL = "https://api.testnet.minepi.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, sellerWalletAddress, orderId } = body;

    console.log("💸 POKUŠAJ ISPLATE (REQUIRE VERZIJA):", { amount, sellerWalletAddress });

    // 1. Učitavanje tajnog ključa
    const secretKey = process.env.PI_WALLET_SECRET;
    if (!secretKey) {
        return NextResponse.json({ error: "Fali S-Key u .env fajlu!" }, { status: 500 });
    }

    // 2. Kreiranje Servera (Sada preko StellarSdk objekta)
    // Ovo je linija koja je pucala, sada bi trebalo da radi
    const server = new StellarSdk.Server(PI_HORIZON_URL);

    // 3. Učitavanje tvog novčanika
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const sourcePublicKey = sourceKeypair.publicKey();

    console.log("🔐 Wallet prepoznat:", sourcePublicKey);

    // 4. Provera računa
    const account = await server.loadAccount(sourcePublicKey);

    // 5. Iznos (Stellar traži string)
    const payoutAmount = (amount * 0.95).toFixed(7); 

    // 6. Kreiranje Transakcije
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: "Pi Testnet" // ⚠️ Za testiranje na Pi Browseru
    })
    .addOperation(StellarSdk.Operation.payment({
        destination: sellerWalletAddress,
        asset: StellarSdk.Asset.native(),
        amount: payoutAmount,
    }))
    .setTimeout(30)
    .build();

    // 7. Potpisivanje
    transaction.sign(sourceKeypair);

    // 8. Slanje
    console.log("🚀 Šaljem transakciju na Pi mrežu...");
    const result = await server.submitTransaction(transaction);
    console.log("✅ ISPLATA USPEŠNA! Hash:", result.hash);

    // 9. Ažuriranje baze
    await prisma.order.update({
        where: { id: orderId },
        data: { status: "completed" }
    });

    return NextResponse.json({ 
        success: true, 
        txHash: result.hash, 
        paidAmount: payoutAmount 
    });

  } catch (error: any) {
    console.error("❌ Payout Greška:", error);
    
    // Detaljniji ispis greške ako je od Stellara
    let errorMsg = error.message;
    if (error.response && error.response.data) {
        console.error("Detalji Stellar greške:", JSON.stringify(error.response.data));
        errorMsg = JSON.stringify(error.response.data.extras?.result_codes || error.response.data);
    }

    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
