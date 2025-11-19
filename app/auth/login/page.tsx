"use client"

import { useState } from 'react';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    // --- SIMULACIJA LOGOVANJA ---
    if (email === 'test@example.com' && password === '12345') {
      alert('Login successful! (SIMULATION)');
      router.push('/'); // Preusmeri na Home
    } else {
      setError('Invalid email or password.');
    }
    // ----------------------------
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <User className="w-10 h-10 mx-auto mb-2 text-primary" />
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-amber-500 text-transparent bg-clip-text">
            Welcome Back!
          </CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to the Invictus Bazaar marketplace.</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            
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
            
            {/* Prikaz greške */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md border border-red-200">
                {error}
              </p>
            )}

            {/* Dugme za Logovanje (Gradient) */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600"
              size="lg"
            >
              Sign In
            </Button>
            
          </form>

          {/* Link za Registraciju */}
          <div className="mt-6 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:underline font-medium">
              Register here
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}