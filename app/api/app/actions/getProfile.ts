"use server"

import { prisma } from "@/lib/prisma";

// 1. Funkcija koja dovlači sve podatke za Profil
export async function getUserProfile(username: string) {
  if (!username) return null;

  const user = await prisma.user.findUnique({
    where: { username: username },
    include: {
      // Šta sam kupio
      orders: {
        include: { service: true, seller: true },
        orderBy: { createdAt: 'desc' }
      },
      // Šta sam prodao (Moji klijenti)
      sales: {
        include: { service: true, buyer: true },
        orderBy: { createdAt: 'desc' }
      },
      // Moje usluge koje nudim
      services: true,
    }
  });

  return user;
}

// 2. Funkcija za čuvanje Wallet adrese
export async function updateWalletAddress(username: string, walletAddress: string) {
    // Prosta validacija
    if (!walletAddress.startsWith('G') || walletAddress.length < 50) {
        throw new Error("Adresa mora počinjati sa velikim slovom 'G' i imati 56 karaktera.");
    }
    
    await prisma.user.update({
        where: { username },
        data: { piWallet: walletAddress }
    });
    
    return { success: true };
}