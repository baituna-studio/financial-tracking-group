"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const user = await getCurrentUser()
        console.log("Current user:", user?.id)
        setUserId(user?.id ?? null)
      } catch (e) {
        console.error("Error checking current user:", e)
        setUserId(null)
      } finally {
        setCheckingAuth(false)
      }
    }
    
    checkCurrentUser()
  }, [])

  const acceptInvite = async (uid: string) => {
    if (busy) return // Prevent double calls
    
    setBusy(true)
    setErrorMsg(null)
    
    try {
      console.log("Accepting invite with token:", token, "for user:", uid)
      
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, userId: uid }),
      })
      
      const data = await res.json()
      console.log("Accept invite response:", data)
      
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Gagal menerima undangan")
      }
      
      toast({ 
        title: "Berhasil bergabung", 
        description: data.message || "Anda telah ditambahkan ke grup." 
      })
      
      // Redirect ke groups page
      router.push("/groups")
      
    } catch (e: any) {
      console.error("Accept invite error:", e)
      const errorMessage = e?.message || "Terjadi kesalahan"
      setErrorMsg(errorMessage)
      toast({ 
        title: "Gagal bergabung", 
        description: errorMessage, 
        variant: "destructive" 
      })
    } finally {
      setBusy(false)
    }
  }

  const handleLogin = async (formData: FormData) => {
    setBusy(true)
    setErrorMsg(null)
    
    try {
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      
      console.log("Attempting login for:", email)
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      
      const uid = data.user?.id
      if (!uid) throw new Error("Login berhasil namun user tidak ditemukan")
      
      console.log("Login successful, user ID:", uid)
      setUserId(uid)
      
      // Accept invite after successful login
      await acceptInvite(uid)
      
    } catch (e: any) {
      console.error("Login error:", e)
      setErrorMsg(e?.message || "Login gagal")
    } finally {
      setBusy(false)
    }
  }

  const handleRegister = async (formData: FormData) => {
    setBusy(true)
    setErrorMsg(null)
    
    try {
      const fullName = formData.get("fullName") as string
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      console.log("Starting registration for:", email)

      // Daftar dengan auto-confirm jika email verification dimatikan
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { full_name: fullName },
          emailRedirectTo: undefined
        },
      })
      
      if (error) {
        console.error("Auth signup error:", error)
        throw error
      }

      console.log("Auth signup result:", data)

      // Jika user langsung tersedia (auto-confirm aktif)
      if (data.user && data.user.email_confirmed_at) {
        console.log("User auto-confirmed, creating profile...")
        
        // Buat profil
        const { error: profErr } = await supabase.from("profiles").upsert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })
        
        if (profErr) {
          console.error("Profile creation error:", profErr)
          throw profErr
        }

        console.log("Profile created, accepting invite...")
        setUserId(data.user.id)
        await acceptInvite(data.user.id)
        return
      }

      // Jika perlu email confirmation
      if (data.user && !data.user.email_confirmed_at) {
        console.log("User created but needs email confirmation")
        toast({
          title: "Pendaftaran berhasil",
          description: "Silakan verifikasi email Anda lalu kembali ke link undangan ini untuk bergabung.",
        })
        return
      }

      // Fallback
      toast({
        title: "Pendaftaran berhasil",
        description: "Silakan verifikasi email Anda lalu kembali ke link undangan ini untuk bergabung.",
      })

    } catch (e: any) {
      console.error("Registration error:", e)
      setErrorMsg(e?.message || "Pendaftaran gagal")
    } finally {
      setBusy(false)
    }
  }

  // Auto-accept invite if user is already logged in
  useEffect(() => {
    if (!checkingAuth && userId && !busy) {
      console.log("User already logged in, auto-accepting invite")
      acceptInvite(userId)
    }
  }, [checkingAuth, userId, busy])

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  // If user is logged in and busy (processing invite), show loading
  if (userId && busy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memproses undangan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Terima Undangan</CardTitle>
            <CardDescription>
              Jika sudah punya akun, silakan masuk lalu Anda akan otomatis bergabung ke grup undangan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">Email</Label>
                <Input id="email-login" name="email" type="email" placeholder="email@domain.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-login">Password</Label>
                <Input id="password-login" name="password" type="password" placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Memproses..." : "Masuk & Bergabung"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Belum Punya Akun?</CardTitle>
            <CardDescription>Daftar cepat, lalu Anda akan otomatis ditambahkan ke grup.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input id="fullName" name="fullName" placeholder="Nama Anda" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-reg">Email</Label>
                <Input id="email-reg" name="email" type="email" placeholder="email@domain.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-reg">Password</Label>
                <Input id="password-reg" name="password" type="password" placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Memproses..." : "Daftar & Bergabung"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {errorMsg && (
          <div className="md:col-span-2">
            <Alert variant="destructive">
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="md:col-span-2 text-center text-sm text-gray-600">
          <Link href="/">Kembali ke halaman login</Link>
        </div>
      </div>
    </div>
  )
}
