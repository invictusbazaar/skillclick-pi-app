'use client';

import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    Pi: any;
  }
}

export default function PopraviPlacanje() {
  const [status, setStatus] = useState<string>('Spreman za proveru.');
  const [loading, setLoading] = useState<boolean>(false);

  const ocistiPlacanja = async () => {
    setLoading(true);
    setStatus('Pokrećem proveru zapelih plaćanja...');

    try {
      if (!window.Pi) {
        throw new Error('Pi SDK nije učitan. Otvorite stranicu unutar Pi Browser-a.');
      }

      // Funkcija koja prisilno traži nedovršena plaćanja preko SDK-a
      await window.Pi.authenticate(['payments'], (payment: any) => {
        console.log("Pronađeno nedovršeno plaćanje:", payment);
        // Ovde šaljemo signal tvom backendu da otkaže ili završi transakciju
        return fetch('/api/orders', {
          method: 'POST',
          body: JSON.stringify({ 
            action: 'cancel', 
            paymentId: payment.identifier 
          }),
        });
      });

      setStatus('Provera završena. Ako je bilo zapelih plaćanja, ona su sada procesuirana.');
    } catch (error: any) {
      console.error(error);
      setStatus(`Greška: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Pi Payment Fixer 🛠️</h1>
      <p style={{ marginBottom: '20px' }}>
        Ova stranica služi za ručno čišćenje transakcija koje su ostale u stanju "Pending".
      </p>
      
      <div style={{ 
        padding: '15px', 
        background: '#f4f4f4', 
        borderRadius: '8px', 
        marginBottom: '20px',
        minHeight: '50px'
      }}>
        <strong>Status:</strong> {status}
      </div>

      <button
        onClick={ocistiPlacanja}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#8a2be2',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        {loading ? 'Čistim...' : 'Očisti zapela plaćanja'}
      </button>

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <p>Nakon klika, sačekajte par sekundi. Ako se ništa ne desi, znači da nema trenutno zapelih transakcija u SDK-u.</p>
      </div>
    </div>
  );
}