import { NextResponse } from "next/server";

const PI_API_KEY = "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp";

export async function POST(req: Request) {
  try {
    const { payment } = await req.json();
    const paymentId = payment.identifier;
    const txid = payment.transaction?.txid;

    if (txid) {
      // Sredstva su prešla, kompletiramo da oslobodimo nalog
      await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Key ${PI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ txid })
      });
    } else {
      // Sredstva nisu prešla, otkazujemo
      await fetch(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Key ${PI_API_KEY}`, 'Content-Type': 'application/json' }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
