"use client"

import { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // --- SIMULACIJA REGISTRACIJE ---
    if (email && password) {
        alert('Registration successful! (SIMULATION)');
        router.push('/auth/login'); // Vrati na Login nakon uspeha
    } else {
        setError('Please fill in all fields.');
    }
    // ---------------------------------
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <User className="w-10 h-10 mx-auto mb-2 text-primary" />
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-amber-500 text-transparent bg-clip-text">
            Join the Marketplace
          </CardTitle>
          <p className="text-sm text-muted-foreground">Create your Invictus Bazaar account.</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* Polje za Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center"><Mail className="w-4 h-4 mr-2" /> Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Polje za Lozinku */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center"><Lock className="w-4 h-4 mr-2" /> Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Polje za Potvrdu Lozinke */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            {/* Prikaz greške */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md border border-red-200">
                {error}
              </p>
            )}

            {/* Dugme za Registraciju (Gradient) */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600"
              size="lg"
            >
              Create Account
            </Button>
            
          </form>

          {/* Link za Login */}
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}