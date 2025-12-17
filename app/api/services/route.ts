import { NextResponse } from 'next/server';

export async function GET() {
  // Vraćamo prazan niz da očistimo aplikaciju
  return NextResponse.json([]);
}