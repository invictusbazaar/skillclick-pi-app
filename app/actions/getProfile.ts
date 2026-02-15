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
        include: { 
            service: true, 
            seller: true,
            reviews: true // 👈 DODATO: Da vidimo da li sam već ostavio ocenu
        },
        orderBy: { createdAt: 'desc' }
      },
      // Šta sam prodao (Moji klijenti)
      sales: {
        include: { 
            service: true, 
            buyer: true,
            reviews: true // 👈 DODATO: Da vidimo da li sam već ocenio kupca
        },
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

// 3. Funkcija za čuvanje Avatar slike
export async function updateUserAvatar(username: string, base64Image: string) {
    try {
        await prisma.user.update({
            where: { username },
            data: { avatar: base64Image }
        });
        
        return { success: true };
    } catch (error: any) {
        console.error("PRISMA GREŠKA PRI ČUVANJU AVATARA:", error);
        return { error: error.message || "Greška pri upisu u bazu podataka" };
    }
}