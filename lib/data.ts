import React from 'react';
import { Palette, Code, PenTool, Video, Wrench, Car, Layers } from 'lucide-react';

// Ovo je JEDINA lista oglasa koju aplikacija koristi.
export const SERVICES_DATA = [
  { 
    id: 1, 
    title: "Popravka Alfa Romeo 159", 
    author: "majstor_mika", 
    price: 500, 
    rating: 5.0, 
    reviews: 12, 
    description: "Kompletna dijagnostika i popravka za Alfa Romeo 159. Specijalizovan za JTDm motore i elektroniku. Dolazak na adresu u Novom Sadu.",
    deliveryTime: "2 Dana",
    // ✅ PROMENJENO: Sada je u Lifestyle kategoriji
    category: "lifestyle", 
    icon: React.createElement(Car, { className: "text-white h-16 w-16" }) 
  },
  { 
    id: 2, 
    title: "Izrada CNC Fajlova (Lightburn)", 
    author: "cnc_pro", 
    price: 30, 
    rating: 4.9, 
    reviews: 8,
    description: "Priprema profesionalnih SVG fajlova za lasersko sečenje i graviranje. Optimizovano za Lightburn softver. Brza isporuka.",
    deliveryTime: "1 Dan",
    category: "design",
    icon: React.createElement(Wrench, { className: "text-white h-16 w-16" }) 
  },
  { 
    id: 3, 
    title: "Modern Minimalist Logo Design", 
    author: "pixel_art", 
    price: 50, 
    rating: 5.0, 
    reviews: 124, 
    description: "I will design a professional, modern, and unique minimalist logo for your brand. Includes vector files.",
    deliveryTime: "2 Days",
    category: "design",
    icon: React.createElement(Palette, { className: "text-white h-16 w-16" })
  },
  { 
    id: 4, 
    title: "Full Stack Web Development", 
    author: "dev_guy", 
    price: 300, 
    rating: 4.9, 
    reviews: 85,
    description: "Complete web application development using React and Next.js.",
    deliveryTime: "7 Days",
    category: "programming",
    icon: React.createElement(Code, { className: "text-white h-16 w-16" })
  },
  { 
    id: 5, 
    title: "SEO Blog Writing", 
    author: "writer_pro", 
    price: 30, 
    rating: 4.8, 
    reviews: 210, 
    description: "High quality SEO articles for your blog.",
    deliveryTime: "1 Day",
    category: "writing",
    icon: React.createElement(PenTool, { className: "text-white h-16 w-16" }) 
  },
  { 
    id: 6, 
    title: "Video Editing 4K", 
    author: "vid_master", 
    price: 100, 
    rating: 5.0, 
    reviews: 42, 
    description: "Professional video editing and color grading.",
    deliveryTime: "3 Days",
    category: "video",
    icon: React.createElement(Video, { className: "text-white h-16 w-16" }) 
  }
];