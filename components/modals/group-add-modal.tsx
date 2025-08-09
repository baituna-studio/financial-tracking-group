"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"

interface GroupAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function GroupAddModal({ isOpen, onClose, onSuccess }: GroupAddModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
    }
    if (isOpen) {
      fetchUser()
    }
  }, [isOpen])

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      if (!currentUser) {
        throw new Error("Pengguna tidak terautentikasi.")
      }

      const name = formData.get("name") as string
      const description = (formData.get("description") as string) || null

      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, createdBy: currentUser.id }),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Gagal membuat grup")
      }

      toast({ title: "Grup berhasil dibuat", description: "Grup baru telah disimpan." })
      onSuccess()
      onClose()
    } catch (error: any) {
      toast({ title: "Gagal membuat grup", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Grup Baru</DialogTitle>
          <DialogDescription>Buat grup baru untuk mengelola keuangan bersama.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Grup</Label>
              <Input id="name" name="name" placeholder="Contoh: Grup Keluarga, Teman Kos" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Textarea id="description" name="description" placeholder="Deskripsi singkat tentang grup ini" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Membuat..." : "Buat Grup"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
