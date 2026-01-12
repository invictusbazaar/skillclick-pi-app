import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Putanja do services.json fajla u root folderu projekta
    const filePath = path.join(process.cwd(), 'services.json');
    
    // Provera postojanja fajla
    if (!fs.existsSync(filePath)) {
      console.error("ModDB greška: services.json ne postoji u root-u!");
      return NextResponse.json([], { status: 200 }); // Vraćamo prazan niz da ne pukne front-end
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const services = JSON.parse(fileContents);

    // Vraćamo podatke uz obavezno isključivanje keširanja za Pi Browser
    return NextResponse.json(services, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error("Greška u API ruti:", error);
    return NextResponse.json({ error: "Interna greška servera" }, { status: 500 });
  }
}
