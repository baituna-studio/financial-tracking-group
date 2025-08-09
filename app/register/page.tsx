"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const fullName = formData.get("fullName") as string
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/` : undefined

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      // Show success info depending on email confirmation setting
      toast({
        title: "Pendaftaran berhasil",
        description:
          "Jika verifikasi email diaktifkan, silakan cek inbox Anda untuk konfirmasi sebelum login.",
      })

      // Optionally redirect to login
      router.push("/")
    } catch (err: any) {
      toast({
        title: "Gagal mendaftar",
        description: err?.message || "Terjadi kesalahan saat mendaftar.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            Akun akan dibuat melalui Supabase Auth. Beberapa proyek mengharuskan verifikasi email setelah daftar.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Daftar Akun</CardTitle>
            <CardDescription>Buat akun baru untuk mulai mengelola keuangan</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input id="fullName" name="fullName" placeholder="Nama Lengkap" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="nama@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Daftar"}
              </Button>
              <div className="text-sm text-center text-gray-600">
                Sudah punya akun?{" "}
                <Link href="/" className="font-medium text-blue-600 hover:underline">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
