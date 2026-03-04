import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const API_KEY = process.env.PI_API_KEY;
  
  try {
    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json({ error: "Nema Payment ID-a" }, { status: 400 });
    }

    const report = {
      id: paymentId,
      akcija: "POKUŠAJ_POPRAVKE",
      status_kod: 0,
      odgovor_servera: {} as any
    };

    // 1. POKUŠAJ KOMPLETIRANJA (Najčešći lek za refundirane a zaglavljene)
    // Često transakcija visi jer čeka 'complete' poziv
    console.log(`🔧 Fixer: Pokušavam COMPLETE za ${paymentId}`);
    
    const completeRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Key ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ txid: '' }) // Prazan txid nekad prolazi za force complete
    });

    const completeData = await completeRes.json();
    
    if (completeRes.ok) {
        report.akcija = "USPEŠNO_KOMPLETIRANO";
        report.status_kod = 200;
        report.odgovor_servera = completeData;
    } else {
        // Ako complete ne uspe (npr. nije approved), probamo CANCEL
        console.log(`🔧 Fixer: Complete nije uspeo (${completeData?.error}), probam CANCEL...`);
        
        const cancelRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {
            method: 'POST',
            headers: { 'Authorization': `Key ${API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        
        const cancelData = await cancelRes.json();
        report.akcija = cancelRes.ok ? "USPEŠNO_OTKAZANO" : "NIJE_USPELA_POPRAVKA";
        report.status_kod = cancelRes.status;
        report.odgovor_servera = cancelData; // Ovde ćeš videti onaj "already_completed" error
    }

    // Vraćamo onaj format koji prepoznaješ
    return NextResponse.json({
        message: "Pametno čišćenje duhova završeno",
        detalji: [report]
    });

  } catch (error: any) {
    return NextResponse.json({ 
        message: "Greška u skripti", 
        error: error.message 
    }, { status: 500 });
  }
}