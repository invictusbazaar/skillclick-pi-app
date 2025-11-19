import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'services.json');

// Funkcija za čitanje svih servisa (Simulacija GET API poziva)
export async function GET() {
  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf-8');
    const services = JSON.parse(fileContents);
    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to read data" }, { status: 500 });
  }
}

// Funkcija za dodavanje novog servisa (Simulacija POST API poziva)
export async function POST(request: Request) {
  try {
    const newService = await request.json();

    // 1. Pročitaj postojeće podatke
    const fileContents = fs.readFileSync(dataFilePath, 'utf-8');
    const services = JSON.parse(fileContents);

    // 2. Dodaj novi ID i ubaci novi oglas
    const newId = services.length > 0 ? Math.max(...services.map((s: any) => s.id)) + 1 : 1;
    
    // FIX: Autor se sada uzima iz newService (frontenda), a ne hardkoduje
    const serviceToSave = { 
        ...newService, 
        id: newId, 
        rating: 5.0 // Dajemo mu početnu ocenu
    };
    
    services.push(serviceToSave);

    // 3. Zapiši podatke nazad u JSON fajl
    fs.writeFileSync(dataFilePath, JSON.stringify(services, null, 2), 'utf-8');

    return NextResponse.json({ message: "Service successfully added", service: serviceToSave }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: "Failed to add service", error: error }, { status: 500 });
  }
}