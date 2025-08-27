'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
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
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, Eye, EyeOff, Lock, Mail, User, Shield } from 'lucide-react';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSignUp = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const fullName = formData.get('fullName') as string;
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/`
          : undefined;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: fullName,
            email: email,
          },
        },
      });
      console.log('data', data);

      const res = await fetch(`/api/profiles/${data.user?.id}`, {
        method: 'POST',
        body: JSON.stringify({
          id: data.user?.id,
          full_name: fullName,
          email: email,
          month_start_day: 1,
          updated_at: new Date().toISOString(),
        }),
      });
      console.log('res', res);
      const resData = await res.json();
      if (!res.ok || !resData.ok) {
        throw new Error(resData.error || 'Gagal membuat akun');
      }

      if (error) throw error;

      toast({
        title: 'Pendaftaran berhasil',
        description:
          'Jika verifikasi email diaktifkan, silakan cek inbox Anda untuk konfirmasi sebelum login.',
      });

      router.push('/');
    } catch (err: any) {
      toast({
        title: 'Gagal mendaftar',
        description: err?.message || 'Terjadi kesalahan saat mendaftar.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md space-y-6">
        {/* Logo and Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-lg">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Financial App
            </h1>
            <p className="text-gray-600 mt-2">
              Bergabunglah dengan kami hari ini
            </p>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="border-green-200 bg-green-50/80 backdrop-blur-sm">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 text-sm">
            <span className="font-semibold">Financial App Group</span>{' '}
            membutuhkan verifikasi email setelah daftar.
            <br />
            <span className="text-red-600 font-medium">
              Pastikan email yang Anda gunakan valid dan aktif!
            </span>
          </AlertDescription>
        </Alert>

        {/* Register Card */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Daftar Akun Baru
            </CardTitle>
            <CardDescription className="text-gray-600">
              Buat akun untuk mulai mengelola keuangan Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={handleSignUp} className="space-y-5">
              {/* Full Name Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-sm font-medium text-gray-700"
                >
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Masukkan nama lengkap Anda"
                    className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Masukkan email Anda"
                    className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Buat password yang kuat"
                    className="pl-10 pr-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </div>
                ) : (
                  'Daftar Sekarang'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  sudah punya akun?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <Link href="/" className="block">
              <Button
                type="button"
                className="w-full h-12 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold rounded-xl transition-all duration-200"
              >
                Masuk ke Akun
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 Financial App. Semua hak dilindungi.</p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
