"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

interface CategoryAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CategoryAddModal({ isOpen, onClose, onSuccess }: CategoryAddModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [groups, setGroups] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) loadGroups()
  }, [isOpen])

  const loadGroups = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return
      const { data } = await supabase
        .from("user_groups")
        .select("group_id, groups(*)")
        .eq("user_id", user.id)
      if (data) setGroups(data.map((ug) => ug.groups).filter(Boolean))
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error("User not authenticated")

      const name = formData.get("name") as string
      const description = (formData.get("description") as string) || null
      const icon = (formData.get("icon") as string) || "folder"
      const color = (formData.get("color") as string) || "#6B7280"
      const type = (formData.get("type") as string) || "Pengeluaran"
      const groupId = formData.get("groupId") as string

      const { error } = await supabase.from("categories").insert({
        name,
        description,
        icon,
        color,
        type,
        group_id: groupId,
        created_by: user.id,
      })
      if (error) throw error

      toast({ title: "Kategori ditambahkan", description: "Kategori baru telah disimpan." })
      onSuccess()
      onClose()
    } catch (e: any) {
      toast({ title: "Gagal menambah kategori", description: e?.message || "Error", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Tambah Kategori</DialogTitle>
          <DialogDescription>Buat kategori baru untuk Pemasukan atau Pengeluaran.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input id="name" name="name" placeholder="Contoh: Gaji, Makanan, Listrik" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" name="description" placeholder="Deskripsi kategori (opsional)" rows={3} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipe</Label>
              <Select name="type" defaultValue="Pengeluaran" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pemasukan">Pemasukan</SelectItem>
                  <SelectItem value="Pengeluaran">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="groupId">Grup</Label>
              <Select name="groupId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih grup" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="icon">Ikon (nama)</Label>
                <Input id="icon" name="icon" placeholder="utensils, zap, car, heart, dll." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Warna</Label>
                <Input id="color" name="color" type="color" defaultValue="#6B7280" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
