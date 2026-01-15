import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("🚀 Approve ruta je pogođena!"); // Prvi znak da frontend radi

    const body = await request.json();
    const { paymentId } = body;

    console.log("💳 Primljen Payment ID:", paymentId);

    if (!paymentId) {
        return NextResponse.json({ error: "Nema paymentId" }, { status: 400 });
    }

    // Provera da li si uneo ključ u Vercel
    if (!process.env.PI_API_KEY) {
        console.error("❌ GREŠKA: Nedostaje PI_API_KEY u Vercel Environment Variables!");
        return NextResponse.json({ error: "Server nije konfigurisan (fali API key)" }, { status: 500 });
    }

    console.log("📡 Šaljem zahtev ka Pi Network...");

    // Poziv ka Pi Network serverima da odobrimo plaćanje
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}) // Nekad je potrebno poslati prazan objekat
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