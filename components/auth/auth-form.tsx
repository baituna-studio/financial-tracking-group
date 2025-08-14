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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signIn } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [isBootstrappingRochiyat, setIsBootstrappingRochiyat] = useState(false);
  // Tambahkan state untuk Baituna Studio
  const [isBootstrappingBaituna, setIsBootstrappingBaituna] = useState(false);
  const router = useRouter();

  const handleSignIn = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      console.log('email', email);
      console.log('password', password);
      const res = await signIn(email, password);
      console.log('res', res);
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

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('ricky@gmail.com', 'ricky@gmail.com');
      toast({
        title: 'Demo login berhasil',
        description: 'Selamat datang Ricky!',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Demo login gagal',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRochiyatLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('rochiyat@gmail.com', 'rochiyat@gmail.com');
      toast({
        title: 'Login Rochiyat berhasil',
        description: 'Selamat datang Rochiyat!',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login Rochiyat gagal',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Tambahkan function untuk login Baituna Studio
  const handleBaitunaLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('baituna.studio@gmail.com', 'baituna.studio@gmail.com');
      toast({
        title: 'Login Baituna Studio berhasil',
        description: 'Selamat datang Baituna Studio!',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login Baituna Studio gagal',
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
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            Aplikasi ini menggunakan Supabase Auth. Gunakan tombol demo untuk
            membuat dan masuk otomatis.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Aplikasi Keuangan
            </CardTitle>
            <CardDescription>Kelola keuangan Anda dengan mudah</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Demo Login Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={handleDemoLogin}
                  className="w-full text-xs"
                  disabled={isLoading}
                >
                  {isLoading ? '...' : '🚀 Ricky'}
                </Button>
                <Button
                  onClick={handleRochiyatLogin}
                  variant="secondary"
                  className="w-full text-xs"
                  disabled={isLoading}
                >
                  {isLoading ? '...' : '👤 Rochiyat'}
                </Button>
                <Button
                  onClick={handleBaitunaLogin}
                  variant="outline"
                  className="w-full text-xs bg-transparent"
                  disabled={isLoading}
                >
                  {isLoading ? '...' : '🎨 Baituna'}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Atau login manual
                  </span>
                </div>
              </div>

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
