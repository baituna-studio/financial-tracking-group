"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signIn } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      await signIn(email, password)
      toast({
        title: "Berhasil masuk",
        description: "Selamat datang di aplikasi keuangan!",
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Gagal masuk",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      await signIn("ricky@gmail.com", "ricky@gmail.com")
      toast({
        title: "Demo login berhasil",
        description: "Selamat datang Ricky!",
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Demo login gagal",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md space-y-4">
        {/* Demo Login Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            <strong>Mode Demo:</strong> Aplikasi berjalan dengan data dummy. Login dengan kredensial apapun atau gunakan tombol demo.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Aplikasi Keuangan</CardTitle>
            <CardDescription>Kelola keuangan Anda dengan mudah</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Demo Login Button */}
              <Button
                onClick={handleDemoLogin}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Memproses..." : "🚀 Login sebagai Ricky (Demo)"}
              </Button>

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
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="ricky@gmail.com" 
                    defaultValue="ricky@gmail.com"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="ricky@gmail.com" 
                    defaultValue="ricky@gmail.com"
                    required 
                  />
                </div>
                <Button type="submit" variant="outline" className="w-full bg-transparent" disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Login Manual"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
