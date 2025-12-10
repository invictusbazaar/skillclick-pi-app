import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Putanja do naše "baze" korisnika
const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    const { email, password } = userData;

    // 1. Validacija
    if (!email || !password) {
        return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    // 2. Učitaj postojeće korisnike
    let users = [];
    try {
        if (fs.existsSync(usersFilePath)) {
            const fileContents = fs.readFileSync(usersFilePath, 'utf-8');
            users = JSON.parse(fileContents);
        }
    } catch (error) {
        users = [];
    }

    // 3. Proveri da li korisnik već postoji
    if (users.find((u: any) => u.email === email)) {
        return NextResponse.json({ message: "User already exists!" }, { status: 409 });
    }

    // 4. Kreiraj novog korisnika
    const newUser = {
        id: Date.now(),
        email,
        password, // U pravoj aplikaciji ovde ide hashovanje lozinke!
        username: email.split('@')[0], // Pravimo username od emaila (npr. marko od marko@gmail.com)
        role: 'user',
        piBalance: "0.00",
        createdAt: new Date().toISOString()
    };

    // 5. Sačuvaj u fajl
    users.push(newUser);
    
    // Provera da li folder data postoji
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');

    return NextResponse.json({ message: "User registered successfully", user: newUser }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}