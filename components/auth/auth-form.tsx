"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signIn } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(false)
  const [isBootstrappingRochiyat, setIsBootstrappingRochiyat] = useState(false)
  // Tambahkan state untuk Baituna Studio
  const [isBootstrappingBaituna, setIsBootstrappingBaituna] = useState(false)
  const router = useRouter()

  const handleSignIn = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      await signIn(email, password)
      toast({ title: "Berhasil masuk", description: "Selamat datang di aplikasi keuangan!" })
      router.push("/dashboard")
    } catch (error: any) {
      toast({ title: "Gagal masuk", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      await signIn("ricky@gmail.com", "ricky@gmail.com")
      toast({ title: "Demo login berhasil", description: "Selamat datang Ricky!" })
      router.push("/dashboard")
    } catch (error: any) {
      toast({ title: "Demo login gagal", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRochiyatLogin = async () => {
    setIsLoading(true)
    try {
      await signIn("rochiyat@gmail.com", "rochiyat@gmail.com")
      toast({ title: "Login Rochiyat berhasil", description: "Selamat datang Rochiyat!" })
      router.push("/dashboard")
    } catch (error: any) {
      toast({ title: "Login Rochiyat gagal", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // Tambahkan function untuk login Baituna Studio
  const handleBaitunaLogin = async () => {
    setIsLoading(true)
    try {
      await signIn("baituna.studio@gmail.com", "baituna.studio@gmail.com")
      toast({ title: "Login Baituna Studio berhasil", description: "Selamat datang Baituna Studio!" })
      router.push("/dashboard")
    } catch (error: any) {
      toast({ title: "Login Baituna Studio gagal", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBootstrapRicky = async () => {
    setIsBootstrapping(true)
    try {
      const res = await fetch("/api/bootstrap-ricky", { method: "POST" })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Gagal membuat akun Ricky")
      }
      // Auto sign-in after user is ready
      await signIn("ricky@gmail.com", "ricky@gmail.com")
      toast({ title: "Akun Ricky siap", description: "Login otomatis berhasil." })
      router.push("/dashboard")
    } catch (err: any) {
      toast({
        title: "Gagal bootstrap akun Ricky",
        description: err?.message || "Terjadi kesalahan",
        variant: "destructive",
      })
    } finally {
      setIsBootstrapping(false)
    }
  }

  const handleBootstrapRochiyat = async () => {
    setIsBootstrappingRochiyat(true)
    try {
      const res = await fetch("/api/bootstrap-rochiyat", { method: "POST" })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Gagal membuat/update akun Rochiyat")
      }

      // Auto sign-in after user is ready
      await signIn("rochiyat@gmail.com", "rochiyat@gmail.com")

      const actionText = data.action === "updated" ? "diperbarui" : "dibuat"
      toast({
        title: `Akun Rochiyat ${actionText}`,
        description: "Login otomatis berhasil dengan data sample.",
      })
      router.push("/dashboard")
    } catch (err: any) {
      toast({
        title: "Gagal bootstrap akun Rochiyat",
        description: err?.message || "Terjadi kesalahan",
        variant: "destructive",
      })
    } finally {
      setIsBootstrappingRochiyat(false)
    }
  }

  // Tambahkan function untuk bootstrap Baituna Studio
  const handleBootstrapBaituna = async () => {
    setIsBootstrappingBaituna(true)
    try {
      const res = await fetch("/api/bootstrap-baituna", { method: "POST" })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Gagal membuat/update akun Baituna Studio")
      }

      // Auto sign-in after user is ready
      await signIn("baituna.studio@gmail.com", "baituna.studio@gmail.com")

      const actionText = data.action === "updated" ? "diperbarui" : "dibuat"
      toast({
        title: `Akun Baituna Studio ${actionText}`,
        description: "Login otomatis berhasil dan ditambahkan ke Grup Rochiyat.",
      })
      router.push("/dashboard")
    } catch (err: any) {
      toast({
        title: "Gagal bootstrap akun Baituna Studio",
        description: err?.message || "Terjadi kesalahan",
        variant: "destructive",
      })
    } finally {
      setIsBootstrappingBaituna(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            Aplikasi ini menggunakan Supabase Auth. Gunakan tombol demo untuk membuat dan masuk otomatis.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Aplikasi Keuangan</CardTitle>
            <CardDescription>Kelola keuangan Anda dengan mudah</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Demo Login Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={handleDemoLogin} className="w-full text-xs" disabled={isLoading}>
                  {isLoading ? "..." : "🚀 Ricky"}
                </Button>
                <Button
                  onClick={handleRochiyatLogin}
                  variant="secondary"
                  className="w-full text-xs"
                  disabled={isLoading}
                >
                  {isLoading ? "..." : "👤 Rochiyat"}
                </Button>
                <Button
                  onClick={handleBaitunaLogin}
                  variant="outline"
                  className="w-full text-xs bg-transparent"
                  disabled={isLoading}
                >
                  {isLoading ? "..." : "🎨 Baituna"}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Atau login manual</span>
                </div>
              </div>

              <form action={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="email@domain.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="••••••••" required />
                </div>
                <Button type="submit" variant="outline" className="w-full bg-transparent" disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Login"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Setup otomatis</span>
                </div>
              </div>

              {/* Bootstrap Buttons */}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={handleBootstrapRicky}
                  disabled={isBootstrapping}
                >
                  {isBootstrapping ? "Mempersiapkan..." : "✨ Buat/Update Akun Ricky"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={handleBootstrapRochiyat}
                  disabled={isBootstrappingRochiyat}
                >
                  {isBootstrappingRochiyat ? "Mempersiapkan..." : "🔧 Buat/Update Akun Rochiyat"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={handleBootstrapBaituna}
                  disabled={isBootstrappingBaituna}
                >
                  {isBootstrappingBaituna ? "Mempersiapkan..." : "🎨 Buat/Update Akun Baituna Studio"}
                </Button>
              </div>

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
  )
}
