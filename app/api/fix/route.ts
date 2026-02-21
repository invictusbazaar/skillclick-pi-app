import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PI_API_KEY = "ggtwprdwtcysquwu3etvsnzyyhqiof8nczp7uo8dkjce4kdg4orgirfjnbgfjkzp";

export async function GET() {
    try {
        // Pronalazi sve narudžbine koje bi mogle biti zaglavljene na Pi serveru
        const stuckOrders = await prisma.order.findMany({
            where: {
                status: { in: ["refunded", "canceled", "pending"] },
                paymentId: { not: null }
            }
        });

        let results = [];

        for (const order of stuckOrders) {
            if (!order.paymentId) continue;

            try {
                let res;
                if (order.txid) {
                    // Sredstva su prešla, kompletiramo na Pi serveru
                    res = await fetch(`https://api.minepi.com/v2/payments/${order.paymentId}/complete`, {
                        method: 'POST',
                        headers: { 'Authorization': `Key ${PI_API_KEY}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ txid: order.txid })
                    });
                } else {
                    // Sredstva nisu prešla, otkazujemo na Pi serveru
                    res = await fetch(`https://api.minepi.com/v2/payments/${order.paymentId}/cancel`, {
                        method: 'POST',
                        headers: { 'Authorization': `Key ${PI_API_KEY}`, 'Content-Type': 'application/json' }
                    });
                }
                results.push({ id: order.paymentId, status: res.status });
            } catch (e) {
                results.push({ id: order.paymentId, error: "Mrežna greška" });
            }
        }

        return NextResponse.json({ message: "Čišćenje je završeno!", detalji: results });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}