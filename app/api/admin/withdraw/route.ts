import { NextResponse } from "next/server";
var StellarSdk = require('stellar-sdk');

const PI_HORIZON_URL = "https://api.testnet.minepi.com";
// ZACEMENTIRANA TVOJA LIČNA ADRESA - Maksimalna bezbednost!
const ADMIN_PERSONAL_WALLET = "GAIXI5GWJCYRV7JALR7FLKYOSNJ6L2VVKRBOQC2TIC5VK6K5FSUDTKJE";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
        return NextResponse.json({ error: "Neispravan iznos za isplatu!" }, { status: 400 });
    }

    const withdrawAmount = parseFloat(amount).toFixed(7);
    console.log(`💸 ADMIN POVLAČI PROFIT: ${withdrawAmount} Pi na ${ADMIN_PERSONAL_WALLET}`);

    const secretKey = process.env.PI_WALLET_SECRET;
    // ✅ NOVI KOD: Preciznija poruka koja će naterati Vercel na novi Build
    if (!secretKey) return NextResponse.json({ error: "Vercel ne vidi PI_WALLET_SECRET iz Settings-a!" }, { status: 500 });

    const server = new StellarSdk.Server(PI_HORIZON_URL);
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const account = await server.loadAccount(sourceKeypair.publicKey());
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: 100000, 
        networkPassphrase: "Pi Testnet" 
    })
    .addOperation(StellarSdk.Operation.payment({
        destination: ADMIN_PERSONAL_WALLET,
        asset: StellarSdk.Asset.native(),
        amount: withdrawAmount, 
    }))
    .setTimeout(30)
    .build();

    transaction.sign(sourceKeypair);

    console.log("🚀 Šaljem profit na tvoj lični novčanik...");
    const result = await server.submitTransaction(transaction);
    console.log("✅ PROFIT USPEŠNO POVUČEN! Hash:", result.hash);

    return NextResponse.json({ success: true, txHash: result.hash });

  } catch (error: any) {
    console.error("❌ Greška pri povlačenju profita:", error);
    
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
