import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache"; // 👇 NOVO: Za osvežavanje Admin panela

// Koristimo staru verziju biblioteke
var StellarSdk = require('stellar-sdk');

const PI_HORIZON_URL = "https://api.testnet.minepi.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, sellerWalletAddress, orderId } = body;

    console.log("💸 POKUŠAJ ISPLATE:", { amount, sellerWalletAddress });

    // 1. SIGURNOSNA PROVERA: Da li je porudžbina već isplaćena?
    const existingOrder = await prisma.order.findUnique({
        where: { id: orderId }
    });

    if (!existingOrder) {
        return NextResponse.json({ error: "Porudžbina ne postoji!" }, { status: 404 });
    }

    if (existingOrder.status === "completed") {
        console.log("🛑 STOP: Pokušaj duple isplate!");
        return NextResponse.json({ error: "Ova porudžbina je već isplaćena!" }, { status: 400 });
    }

    // 2. Provera ključeva
    const secretKey = process.env.PI_WALLET_SECRET;
    if (!secretKey) return NextResponse.json({ error: "Fali S-Key u .env fajlu!" }, { status: 500 });

    const server = new StellarSdk.Server(PI_HORIZON_URL);
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const account = await server.loadAccount(sourceKeypair.publicKey());
    
    // Iznos (95%)
    const payoutAmount = (amount * 0.95).toFixed(7); 

    // 3. Transakcija
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: 100000, // 0.01 Pi
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

    console.log("🚀 Šaljem transakciju...");
    const result = await server.submitTransaction(transaction);
    console.log("✅ ISPLATA USPEŠNA! Hash:", result.hash);

    // 4. Ažuriranje baze
    await prisma.order.update({
        where: { id: orderId },
        data: { status: "completed" }
    });

    // 👇 KLJUČNO: Ovde kažemo Next.js-u da ODMAH osveži Admin panel
    revalidatePath("/admin"); 

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