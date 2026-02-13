"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Camera, X, Check, Loader2, User } from "lucide-react";

// Pomoćna funkcija za kreiranje slike
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

// Pomoćna funkcija za isecanje (cropovanje)
async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  // Fiksna mala rezolucija za avatar (brzo se učitava, ne opterećuje bazu)
  canvas.width = 250;
  canvas.height = 250;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    250,
    250
  );

  // Kompresija na 80% kvaliteta u JPEG formatu (ekstremno mala težina fajla)
  return canvas.toDataURL("image/jpeg", 0.8);
}

interface AvatarUploaderProps {
  currentAvatar: string | null;
  username: string;
  onAvatarUpdate: (base64Image: string) => Promise<void>;
}

export default function AvatarUploader({ currentAvatar, username, onAvatarUpdate }: AvatarUploaderProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Otvaranje fajla sa telefona
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => setImageSrc(reader.result as string));
      reader.readAsDataURL(file);
    }
    // Resetuj input da bi mogao isti fajl ponovo da se izabere ako treba
    e.target.value = '';
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Čuvanje isecene slike
  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsUploading(true);
    try {
      const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImageBase64) {
        await onAvatarUpdate(croppedImageBase64);
      }
      setImageSrc(null); // Zatvara modal nakon uspeha
    } catch (e) {
      console.error("Greška pri isecanju slike:", e);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="relative group cursor-pointer w-20 h-20 rounded-full flex-shrink-0">
        {currentAvatar ? (
          <img src={currentAvatar} alt={username} className="w-20 h-20 rounded-full object-cover border border-purple-200 shadow-sm" />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center text-purple-600 shadow-inner border border-purple-200">
            <User className="h-10 w-10" />
          </div>
        )}
        
        {/* Overlay dugme za promenu (poluprovidno crno preko slike) */}
        <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
          <Camera className="w-6 h-6 text-white" />
          <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={onFileChange} />
        </label>
      </div>

      {/* Modal za Cropovanje */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col h-[70vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <h3 className="font-bold text-gray-800">Podesi sliku</h3>
              <button onClick={() => setImageSrc(null)} disabled={isUploading} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative flex-1 w-full bg-gray-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} // Fiksira na kvadrat
                cropShape="round" // Prikazuje okrugli okvir
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full mb-4 accent-purple-600"
              />
              <button
                onClick={handleSave}
                disabled={isUploading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {isUploading ? "Čuvanje..." : "Sačuvaj sliku"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}