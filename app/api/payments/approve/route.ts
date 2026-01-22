import { NextResponse } from 'next/server';

// 👇 VAŽNO: Ovde između navodnika zalepi tvoj dugački API Key sa Pi Portala
const PI_API_KEY = "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp"; 

export async function POST(req: Request) {
  try {
    console.log("🚀 Approve ruta je pogođena!"); 

    const body = await req.json();
    const { paymentId } = body;

    console.log("💳 Primljen Payment ID:", paymentId);

    if (!paymentId) {
        return NextResponse.json({ error: "Nema paymentId" }, { status: 400 });
    }

    // Provera da li je ključ unet
    if (PI_API_KEY === "OVDE_ZALEPI_TVOJ_DUGACKI_API_KEY" || !PI_API_KEY) {
        console.error("❌ GREŠKA: Nisi zamenio API Key u fajlu!");
        return NextResponse.json({ error: "Fali API Key u kodu" }, { status: 500 });
    }

    console.log("📡 Šaljem zahtev ka Pi Network...");

    // Poziv ka Pi Network serverima
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}) 
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Pi Network je odbio zahtev:", errorText);
        return NextResponse.json({ error: `Pi Greška: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    console.log("✅ Uplata uspešno odobrena!");
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("🔥 Fatalna greška na serveru:", error);
    return NextResponse.json({ error: error.message || "Greška na serveru" }, { status: 500 });
  }
}