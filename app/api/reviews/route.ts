import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const reviewsFilePath = path.join(process.cwd(), 'data', 'reviews.json');
const servicesFilePath = path.join(process.cwd(), 'data', 'services.json');

// 1. POST: Dodavanje nove recenzije
export async function POST(request: Request) {
  try {
    const reviewData = await request.json();
    const { serviceId, rating, comment, author } = reviewData;

    if (!serviceId || !rating || !comment || !author) {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Učitaj postojeće recenzije
    let reviews = [];
    try {
        if (fs.existsSync(reviewsFilePath)) {
            const fileContents = fs.readFileSync(reviewsFilePath, 'utf-8');
            reviews = JSON.parse(fileContents);
        }
    } catch (e) { reviews = []; }

    // Dodaj novu recenziju
    const newReview = {
        id: Date.now(),
        serviceId,
        rating,
        comment,
        author,
        date: new Date().toISOString().split('T')[0] // Samo datum YYYY-MM-DD
    };
    reviews.push(newReview);

    // Sačuvaj recenzije
    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2), 'utf-8');

    // --- AŽURIRANJE PROSEČNE OCENE OGLASA ---
    // Moramo da izračunamo novu prosečnu ocenu za taj oglas i sačuvamo je u services.json
    let services = [];
    if (fs.existsSync(servicesFilePath)) {
        services = JSON.parse(fs.readFileSync(servicesFilePath, 'utf-8'));
        const serviceIndex = services.findIndex((s: any) => s.id === serviceId);
        
        if (serviceIndex !== -1) {
            // Nađi sve recenzije za ovaj oglas
            const serviceReviews = reviews.filter((r: any) => r.serviceId === serviceId);
            const totalRating = serviceReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
            const avgRating = (totalRating / serviceReviews.length).toFixed(1); // Npr. "4.5"

            // Ažuriraj oglas
            services[serviceIndex].rating = parseFloat(avgRating);
            services[serviceIndex].reviews = serviceReviews.length; // Broj recenzija
            
            // Sačuvaj ažurirane oglase
            fs.writeFileSync(servicesFilePath, JSON.stringify(services, null, 2), 'utf-8');
        }
    }

    return NextResponse.json({ message: "Review added", review: newReview }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// 2. GET: Dobavljanje recenzija za određeni oglas
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    try {
        if (fs.existsSync(reviewsFilePath)) {
            const fileContents = fs.readFileSync(reviewsFilePath, 'utf-8');
            const allReviews = JSON.parse(fileContents);
            
            if (serviceId) {
                // Vrati samo recenzije za traženi oglas
                const filtered = allReviews.filter((r: any) => r.serviceId === parseInt(serviceId));
                return NextResponse.json(filtered, { status: 200 });
            }
            return NextResponse.json(allReviews, { status: 200 });
        }
        return NextResponse.json([], { status: 200 });
    } catch (e) {
        return NextResponse.json([], { status: 200 });
    }
}