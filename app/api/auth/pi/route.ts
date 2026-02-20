import { NextResponse } from 'next/server';
// 👇 Uvozimo Prismu da možemo da pričamo sa bazom
import { prisma } from '@/lib/prisma'; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { accessToken, user } = body;

    // 1. Provera da li su podaci stigli
    if (!accessToken || !user) {
      return NextResponse.json({ error: 'Nedostaju podaci' }, { status: 400 });
    }

    // 2. Pi Verifikacija (Ovo smo već imali)
    const piVerifyUrl = 'https://api.minepi.com/v2/me';
    const verifyResponse = await fetch(piVerifyUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!verifyResponse.ok) {
      return NextResponse.json({ error: 'Nevalidan Pi token' }, { status: 401 });
    }

    const piUserData = await verifyResponse.json();

    // 3. Sigurnosna provera
    if (piUserData.uid !== user.uid) {
      return NextResponse.json({ error: 'Lažiran identitet' }, { status: 403 });
    }

    // 👇👇👇 OVO JE ONAJ STARI DEO KOJI SMO VRATILI 👇👇👇
    
    // 4. Provera u BAZI (Prisma)
    // Pokušavamo da nađemo korisnika po njegovom Pi UID-u
    let dbUser = await prisma.user.findUnique({
      where: { 
        uid: piUserData.uid 
      }
    });

    // 5. Ako korisnik NE postoji, pravimo ga (REGISTRACIJA)
    if (!dbUser) {
      console.log("Korisnik ne postoji, kreiram novog:", piUserData.username);
      
      dbUser = await prisma.user.create({
        data: {
          uid: piUserData.uid,
          username: piUserData.username,
          // Ovde možeš dodati default vrednosti ako ih imaš u schemi
          // npr. role: 'USER', balance: 0, itd.
        }
      });
    } else {
      console.log("Korisnik pronađen u bazi:", dbUser.username);
    }

    // Vraćamo korisnika iz NAŠE baze (koji sada možda ima i dodatne podatke)
    return NextResponse.json({ 
      success: true, 
      user: dbUser,
      message: 'Ulogovan uspešno' 
    });

  } catch (error) {
    console.error('Database/API Greška:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}