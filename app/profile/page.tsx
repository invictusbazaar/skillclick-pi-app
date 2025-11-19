import { User, Mail, DollarSign, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

export default function ProfilePage() {
  // SADA SU OVDE STVARNI PODACI
  const user = {
    username: "Invictus Bazaar", // NAZIV FIRME NA MESTU KORISNIČKOG IMENA
    email: "invictusbazaar@gmail.com", // STVARNI EMAIL
    piBalance: "150.00 Pi",
    companyLogo: "/logo bazar.png"
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER SEKCIJA SA LOGOM FIRME */}
        <div className="text-center mb-8">
          <img
            src={user.companyLogo}
            alt="Invictus Bazaar Logo"
            width={200}
            height={40}
            className="mx-auto mb-4 object-contain"
          />
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
            {user.username} Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personal control center on the Invictus Bazaar platform. {/* PREVEDENO */}
          </p>
        </div>

        {/* GLAVNE INFORMACIJE */}
        <Card className="shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-3 text-purple-600" />
              Basic Information {/* PREVEDENO */}
            </CardTitle>
            <CardDescription>
              Overview of Your Account. {/* PREVEDENO */}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium text-muted-foreground">Company Name:</span> {/* PREVEDENO */}
              <span className="font-semibold">{user.username}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium text-muted-foreground">Email:</span> {/* PREVEDENO */}
              <span className="font-semibold flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {user.email}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* PI BALANCE KARTICA */}
        <Card className="bg-gradient-to-r from-purple-600 to-amber-500 text-white shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <DollarSign className="w-6 h-6 mr-3" />
              Pi Wallet Balance {/* PREVEDENO */}
            </CardTitle>
            <CardDescription className="text-purple-200">
              Your current Pi Coin balance on the test network. {/* PREVEDENO */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold">{user.piBalance}</p>
          </CardContent>
        </Card>

        {/* AKCIJA ZA ODJAVU */}
        <div className="flex justify-center mt-8">
          <Button variant="destructive" size="lg" className="shadow-lg">
            <LogOut className="w-5 h-5 mr-3" />
            Log Out {/* PREVEDENO */}
          </Button>
        </div>

      </div>
    </div>
  );
}