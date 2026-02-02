import { NextResponse } from 'next/server';
import StellarSdk from 'stellar-sdk';

// ⚠️ KONFIGURACIJA ZA PI TESTNET
// Ovo su adrese koje Pi mreža koristi za testiranje
const HORIZON_URL = 'https://api.testnet.minepi.com';
const NETWORK_PASSPHRASE = 'Pi Testnet';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, sellerWalletAddress } = body;

    // 1. Provera da li imamo sve podatke
    if (!amount || !sellerWalletAddress) {
      return NextResponse.json({ error: 'Nedostaju podaci (iznos ili adresa)' }, { status: 400 });
    }

    // 2. Učitavanje tajnog ključa iz .env fajla
    const secretKey = process.env.PI_WALLET_SECRET;
    if (!secretKey) {
      return NextResponse.json({ error: 'Server greška: Nije podešen PI_WALLET_SECRET' }, { status: 500 });
    }

    // 3. Računanje: Prodavcu ide 95%, nama ostaje 5%
    // Primer: Ako je cena 100 Pi -> 95 Pi ide prodavcu.
    // Koristimo toFixed(7) jer Stellar podržava 7 decimala.
    const payoutAmount = (parseFloat(amount) * 0.95).toFixed(7);
    const feeKept = (parseFloat(amount) - parseFloat(payoutAmount)).toFixed(7);

    console.log(`💸 ISPLATA POKRENUTA:`);
    console.log(`💰 Ukupno: ${amount} Pi`);
    console.log(`👉 Prodavcu šaljem: ${payoutAmount} Pi (${sellerWalletAddress})`);
    console.log(`🏦 Meni ostaje: ${feeKept} Pi (5%)`);

    // 4. Povezivanje na Pi (Stellar) Mrežu
    const server = new StellarSdk.Server(HORIZON_URL);
    
    // Identifikacija našeg novčanika pomoću tajnog ključa
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    
    // Provera stanja na našem računu pre slanja
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

    // 5. Kreiranje Transakcije
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: '10000', // Standardna provizija mreže (0.00001 Pi)
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: sellerWalletAddress,
          asset: StellarSdk.Asset.native(), // "native" znači Pi coin
          amount: payoutAmount,
        })
      )
      .setTimeout(30) // Čekamo max 30 sekundi
      .build();

    // 6. Potpisivanje transakcije našim tajnim ključem
    transaction.sign(sourceKeypair);
    
    // 7. Slanje u mrežu
    const result = await server.submitTransaction(transaction);
    console.log('✅ Isplata uspešna! Hash transakcije:', result.hash);
    
    return NextResponse.json({ 
        success: true, 
        txHash: result.hash, 
        paidAmount: payoutAmount,
        seller: sellerWalletAddress
    });

  } catch (error: any) {
    console.error('❌ Greška pri isplati:', error);
    
    // Vraćamo grešku da znamo šta nije u redu
    return NextResponse.json({ 
        error: error.message || 'Greška u transakciji',
        details: error.response?.data 
    }, { status: 500 });
  }
}