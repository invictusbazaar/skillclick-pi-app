import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    const { email, password } = userData;

    // 1. Učitaj postojeće korisnike
    let users = [];
    if (fs.existsSync(usersFilePath)) {
        const fileContents = fs.readFileSync(usersFilePath, 'utf-8');
        users = JSON.parse(fileContents);
    } else {
        return NextResponse.json({ message: "Login failed: No users found." }, { status: 401 });
    }

    // 2. Pronađi korisnika po emailu
    const user = users.find((u: any) => u.email === email);

    if (!user) {
        return NextResponse.json({ message: "Login failed: User not found." }, { status: 401 });
    }

    // 3. Proveri lozinku (u prototipu nešifrovano)
    if (user.password !== password) {
        return NextResponse.json({ message: "Login failed: Incorrect password." }, { status: 401 });
    }

    // 4. USPEŠNO LOGOVANJE - Vrati podatke korisnika
    // NAPOMENA: Lozinku ne vraćamo u frontend!
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ 
        message: "Login successful!", 
        user: userWithoutPassword 
    }, { status: 200 });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: "Server error during login." }, { status: 500 });
  }
}