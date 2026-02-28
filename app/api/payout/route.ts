import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache"; 

var StellarSdk = require('stellar-sdk');

const PI_HORIZON_URL = "https://api.testnet.minepi.com";
const PI_API_URL = "https://api.minepi.com/v2"; // Pi API endpoint

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sellerWalletAddress, orderId } = body;

    // 1. Pronalaženje porudžbine (Sada povlačimo i paymentId!)
    const existingOrder = await prisma.order.findUnique({
        where: { id: orderId }
    });

    if (!existingOrder) {
        return NextResponse.json({ error: "Porudžbina ne postoji!" }, { status: 404 });
    }

    if (existingOrder.status === "completed") {
        return NextResponse.json({ error: "Ova porudžbina je već isplaćena!" }, { status: 400 });
    }

    // 2. Priprema za Stellar i Pi API
    const secretKey = process.env.PI_WALLET_SECRET;
    const piApiKey = process.env.PI_API_KEY; // Proveri da li imaš ovo u .env

    if (!secretKey || !piApiKey) {
        return NextResponse.json({ error: "Fale ključevi (Secret ili API Key) u .env!" }, { status: 500 });
    }

    // 3. Izvršavanje Blockchain transakcije (Tvoj originalni Stellar kod)
    const payoutAmount = (existingOrder.amount * 0.95).toFixed(7);
    const server = new StellarSdk.Server(PI_HORIZON_URL);
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const account = await server.loadAccount(sourceKeypair.publicKey());
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
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
    const result = await server.submitTransaction(transaction);

    // 4. 🔥 AUTOMATSKO ODGLAVLJIVANJE (Signal Pi Mreži)
    // Ako imamo paymentId u bazi, javljamo Pi serveru da je transakcija FINALIZOVANA
    if (existingOrder.paymentId) {
        try {
            await fetch(`${PI_API_URL}/payments/${existingOrder.paymentId}/complete`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Key ${piApiKey}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ txid: result.hash }) // Šaljemo Stellar Hash kao dokaz
            });
            console.log("✅ Pi API obavešten: Transakcija uspešno zatvorena.");
        } catch (apiErr) {
            console.error("⚠️ Greška pri javljanju Pi API-ju (ali novac je poslat):", apiErr);
        }
    }

    // 5. Ažuriranje baze
    await prisma.order.update({
        where: { id: orderId },
        data: { status: "completed" }
    });

    revalidatePath("/admin"); 

    return NextResponse.json({ 
        success: true, 
        txHash: result.hash 
    });

  } catch (error: any) {
    console.error("❌ Payout Greška:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
