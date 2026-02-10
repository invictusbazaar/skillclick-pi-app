"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface StatusButtonProps {
  orderId: string;
  newStatus: string;
  label: string;
}

export default function StatusButton({ orderId, newStatus, label }: StatusButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    // Sigurnosna provera da ne klikneš slučajno
    if (!confirm("Da li ste sigurni da želite da promenite status ove porudžbine?")) return;

    setLoading(true);
    
    try {
        const res = await fetch('/api/orders/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, newStatus })
        });

        if (res.ok) {
            router.refresh(); // Osveži stranicu da se vidi novi status
        } else {
            alert("Došlo je do greške pri promeni statusa.");
        }
    } catch (e) {
        console.error(e);
        alert("Greška sa serverom.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Button 
        onClick={handleUpdate} 
        disabled={loading} 
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
    >
        {loading ? (
            <Loader2 className="animate-spin w-4 h-4 mr-2"/>
        ) : (
            <Send className="w-4 h-4 mr-2"/>
        )}
        {loading ? "Slanje..." : label}
    </Button>
  );
}