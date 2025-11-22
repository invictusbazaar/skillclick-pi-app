"use client"

import { useState } from 'react';
import { Mail, Lock, User, CheckCircle, UserPlus, Briefcase, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirm) {
        setError("Passwords do not match!");
        setLoading(false);
        return;
    }

    if (!fullName) {
        setError("Please enter your full name.");
        setLoading(false);
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, fullName, role })
        });

        const data = await response.json();

        if (response.ok) {
            setSuccess(true);
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        } else {
            setError(data.message || "Registration failed");
        }
    } catch (err) {
        setError("An error occurred. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  if (success) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50/50">
            <Card className="w-full max-w-md p-8 text-center shadow-xl border-t-4 border-green-500">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome to SkillClick!</h2>
                <p className="text-gray-500 mt-2">Account created successfully.</p>
            </Card>
        </div>
      )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-blue-50/50">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-blue-600">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Join SkillClick
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">Choose your role and create an account.</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* IZBOR ULOGE (ENGLESKI) */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div 
                    onClick={() => setRole('buyer')}
                    className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all ${role === 'buyer' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                >
                    <ShoppingBag className={`w-8 h-8 mx-auto mb-2 ${role === 'buyer' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className={`font-bold ${role === 'buyer' ? 'text-blue-900' : 'text-gray-500'}`}>Buyer</p>
                    <p className="text-xs text-gray-400">I want to buy services</p>
                </div>

                <div 
                    onClick={() => setRole('seller')}
                    className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all ${role === 'seller' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                >
                    <Briefcase className={`w-8 h-8 mx-auto mb-2 ${role === 'seller' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className={`font-bold ${role === 'seller' ? 'text-blue-900' : 'text-gray-500'}`}>Seller</p>
                    <p className="text-xs text-gray-400">I want to sell services</p>
                </div>
            </div>

            {/* Polja za unos */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input id="fullName" type="text" placeholder="Marko Markovic" className="pl-10" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input id="email" type="email" placeholder="name@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input id="confirm" type="password" placeholder="••••••••" className="pl-10" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              </div>
            </div>
            
            {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? "Creating..." : (role === 'seller' ? "Become a Seller" : "Join as Buyer")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">Sign In</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}