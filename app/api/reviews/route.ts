import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const reviewsFilePath = path.join(process.cwd(), 'data', 'reviews.json');

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    try {
        if (!fs.existsSync(reviewsFilePath)) {
            fs.writeFileSync(reviewsFilePath, '[]', 'utf-8'); // Kreiraj ako nema
            return NextResponse.json([], { status: 200 });
        }

        const fileContents = fs.readFileSync(reviewsFilePath, 'utf-8');
        const allReviews = JSON.parse(fileContents);
        
        if (serviceId) {
            const filtered = allReviews.filter((r: any) => r.serviceId === parseInt(serviceId));
            return NextResponse.json(filtered, { status: 200 });
        }
        return NextResponse.json(allReviews, { status: 200 });
    } catch (e) {
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(request: Request) {
  try {
    const reviewData = await request.json();
    const { serviceId, rating, comment, author } = reviewData;

    let reviews = [];
    if (fs.existsSync(reviewsFilePath)) {
        reviews = JSON.parse(fs.readFileSync(reviewsFilePath, 'utf-8'));
    }

    const newReview = {
        id: Date.now(),
        serviceId: parseInt(serviceId),
        rating: parseInt(rating),
        comment,
        author,
        date: new Date().toISOString().split('T')[0]
    };

    reviews.push(newReview);

    // Proveri da li folder postoji
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2), 'utf-8');

    return NextResponse.json({ message: "Review added", review: newReview }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}