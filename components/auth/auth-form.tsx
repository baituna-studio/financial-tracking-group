'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { signIn } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      await signIn(email, password);
      toast({
        title: 'Berhasil masuk',
        description: 'Selamat datang di aplikasi keuangan!',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Gagal masuk',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Aplikasi Keuangan
            </CardTitle>
            <CardDescription>
              Kelola keuangan Anda dengan mudah berdasarkan grup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <form action={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@domain.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled={isLoading}
                >
                  {isLoading ? 'Memproses...' : 'Login'}
                </Button>
              </form>

              <Link href="/register" className="block mt-2">
                <Button type="button" className="w-full">
                  Daftar Akun Baru
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
