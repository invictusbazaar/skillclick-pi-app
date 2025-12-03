import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'services.json');

export async function GET() {
  try {
    // Ako fajl ne postoji, vrati praznu listu
    if (!fs.existsSync(dataFilePath)) {
        return NextResponse.json([], { status: 200 });
    }
    const fileContents = fs.readFileSync(dataFilePath, 'utf-8');
    const services = JSON.parse(fileContents);
    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const newService = await request.json();

    // Proveri da li folder data postoji, ako ne napravi ga
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    // Učitaj postojeće
    let services = [];
    if (fs.existsSync(dataFilePath)) {
        const fileContents = fs.readFileSync(dataFilePath, 'utf-8');
        services = JSON.parse(fileContents);
    }

    const newId = services.length > 0 ? Math.max(...services.map((s: any) => s.id)) + 1 : 1;
    const serviceToSave = { 
        ...newService, 
        id: newId, 
        rating: 5.0 
    };
    
    services.push(serviceToSave);

    fs.writeFileSync(dataFilePath, JSON.stringify(services, null, 2), 'utf-8');

    return NextResponse.json({ message: "Success", service: serviceToSave }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: "Failed to save" }, { status: 500 });
  }
}