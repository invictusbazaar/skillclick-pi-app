import { NextResponse } from "next/server";

const PI_API_KEY = "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp";

// Tačna 3 ID-ja koja su ostala zaglavljena
const STUCK_IDS = [
  "5OplMIGJuSf8tItmYbKDji2U157M",
  "MWQOvXkYc78lcOIl4IhbdPXvOwuW",
  "dPLVCIwTIFYaJoTILAAHZrQX6MJx"
];

export async function GET() {
    let results = [];

    for (const paymentId of STUCK_IDS) {
        try {
            // 1. Pitamo direktno Pi server za pravi status
            const getRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
                headers: { 'Authorization': `Key ${PI_API_KEY}` }
            });
            
            if (!getRes.ok) {
                results.push({ id: paymentId, error: "Nije pronađeno na Pi serveru" });
                continue;
            }

            const piData = await getRes.json();
            const txid = piData.transaction?.txid;

            let actionRes;

            if (txid) {
                // 2. Pare su prešle, šaljemo Pi serveru NJEGOV txid da kompletira
                actionRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
                    method: 'POST',
                    headers: { 'Authorization': `Key ${PI_API_KEY}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ txid: txid })
                });
            } else {
                // 3. Pare nisu prešle, bezbedno otkazujemo
                actionRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {
                    method: 'POST',
                    headers: { 'Authorization': `Key ${PI_API_KEY}`, 'Content-Type': 'application/json' }
                });
            }

            const finalData = await actionRes.json().catch(() => null);

            results.push({ 
                id: paymentId, 
                akcija: txid ? "KOMPLETIRANO" : "OTKAZANO",
                status_kod: actionRes.status,
                odgovor_servera: finalData
            });

        } catch (e: any) {
            results.push({ id: paymentId, error: e.message });
        }
    }

    return NextResponse.json({ message: "Pametno čišćenje duhova završeno", detalji: results });
}
