import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// 👇 KLJUČNA IZMENA: Uvozimo klase direktno, ne kao "StellarSdk.Server"
import { Server, Keypair, TransactionBuilder, Networks, Asset, Operation, BASE_FEE, Horizon } from "stellar-sdk";

// PODEŠAVANJA ZA PI NETWORK
// Za Testiranje koristi: "https://api.testnet.minepi.com"
// Za Pravi rad (Mainnet) koristi: "https://api.mainnet.minepi.com"
const PI_HORIZON_URL = "https://api.testnet.minepi.com"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, sellerWalletAddress, orderId } = body;

    console.log("💸 Payout Start:", { amount, sellerWalletAddress });

    // 1. Provera S-Key (Tvoj tajni ključ iz .env fajla)
    const secretKey = process.env.PI_WALLET_SECRET;
    if (!secretKey) {
        return NextResponse.json({ error: "Server nema konfigurisan Wallet Secret!" }, { status: 500 });
    }

    // 2. Kreiramo Stellar Server instancu (OVDE JE BILA GREŠKA)
    // Sada koristimo direktno "new Server", a ne "new StellarSdk.Server"
    const server = new Server(PI_HORIZON_URL);

    // 3. Učitavamo tvoj App Wallet
    const sourceKeypair = Keypair.fromSecret(secretKey);
    const sourcePublicKey = sourceKeypair.publicKey();

    console.log("🔐 App Wallet učitan:", sourcePublicKey);

    // 4. Učitavamo podatke o tvom računu (Sequence number)
    const account = await server.loadAccount(sourcePublicKey);

    // 5. Računica (95% prodavcu)
    // Pi biblioteka traži stringove za iznose
    const payoutAmount = (amount * 0.95).toFixed(7); 

    console.log(`💰 Šaljem ${payoutAmount} Pi na adresu ${sellerWalletAddress}`);

    // 6. Pravimo Transakciju
    const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: "Pi Testnet" // ⚠️ PAŽNJA: Za produkciju promeni u "Pi Network"
    })
    // Dodajemo operaciju plaćanja
    .addOperation(Operation.payment({
        destination: sellerWalletAddress,
        asset: Asset.native(),
        amount: payoutAmount,
    }))
    // Opciono: Memo da se zna za šta je
    .setTimeout(30)
    .build();

    // 7. Potpisujemo transakciju tvojim ključem
    transaction.sign(sourceKeypair);

    // 8. Šaljemo na Pi Mrežu
    console.log("🚀 Šaljem transakciju...");
    const result = await server.submitTransaction(transaction);
    console.log("✅ Isplata uspešna! Hash:", result.hash);

    // 9. Ažuriramo bazu (Order status -> COMPLETED)
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
    console.error("❌ Payout Error Detalji:", error);
    
    // Često Stellar vraća grešku u 'response.data'
    let errorMsg = error.message;
    if (error.response && error.response.data) {
        errorMsg = JSON.stringify(error.response.data.extras?.result_codes || error.response.data);
    }

    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
