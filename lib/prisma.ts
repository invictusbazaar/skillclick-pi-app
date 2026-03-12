// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    // U produkciji logujemo samo greške da ne bismo gušili Vercel i usporavali bazu.
    // U developmentu ostavljamo sve radi lakšeg debagovanja.
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare global {
  // Omogućava TypeScript-u da prepozna globalnu promenljivu
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// globalThis je moderniji i sigurniji pristup za Next.js Serverless okruženje
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
