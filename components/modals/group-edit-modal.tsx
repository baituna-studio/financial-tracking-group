"use client"

import { useState } from "react"
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

interface GroupEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  group: any | null
}

export function GroupEditModal({ isOpen, onClose, onSuccess, group }: GroupEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    if (!group) return
    setIsLoading(true)
    try {
      const name = formData.get("name") as string
      const description = (formData.get("description") as string) || null

      const res = await fetch(`/api/groups/${group.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Gagal memperbarui grup")
      }

      toast({ title: "Grup berhasil diperbarui", description: "Perubahan telah disimpan." })
      onSuccess()
      onClose()
    } catch (error: any) {
      toast({ title: "Gagal memperbarui grup", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Grup</DialogTitle>
          <DialogDescription>Perbarui informasi grup Anda.</DialogDescription>
        </DialogHeader>
        {group && (
          <form action={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Grup</Label>
                <Input id="name" name="name" defaultValue={group.name} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={group.description || ""}
                  placeholder="Deskripsi singkat tentang grup ini"
                  rows={3}
                />
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
        )}
      </DialogContent>
    </Dialog>
  )
}
