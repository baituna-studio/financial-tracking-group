"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: { id: string; name: string } | null
}

export function InviteDialog({ open, onOpenChange, group }: InviteDialogProps) {
  const [role, setRole] = useState<"member" | "admin">("member")
  const [token, setToken] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null) // State untuk menyimpan user

  const inviteUrl = useMemo(() => {
    if (!token) return ""
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/invite/${token}`
  }, [token])

  useEffect(() => {
    if (!open) {
      setToken("")
      setRole("member")
    }
  }, [open])

  // Fetch current user once when component mounts or dialog opens
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
      } catch (e) {
        console.error("Failed to fetch current user:", e)
        setCurrentUser(null)
      }
    }
    if (open && !currentUser) { // Fetch only if dialog is open and user not yet fetched
      fetchUser()
    }
  }, [open, currentUser])


  const generate = async () => {
    if (!group) {
      toast({ title: "Gagal", description: "Tidak ada grup yang dipilih.", variant: "destructive" })
      console.error("Generate failed: group is null")
      return
    }
    if (!currentUser) {
      toast({ title: "Gagal", description: "Harus login untuk membuat undangan.", variant: "destructive" })
      console.error("Generate failed: currentUser is null")
      return
    }

    setIsGenerating(true)
    try {
      console.log("Attempting to generate invite:")
      console.log("  Group ID:", group.id)
      console.log("  Role:", role)
      console.log("  Created By (User ID):", currentUser.id)
      
      const res = await fetch(`/api/groups/${group.id}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, createdBy: currentUser.id }),
      })
      
      console.log("API Response Status:", res.status)
      const data = await res.json()
      console.log("API Response Data:", data)
      
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Gagal membuat link undangan")
      }
      
      setToken(data.token)
      toast({ title: "Link undangan dibuat", description: "Salin link dan bagikan ke orang yang diundang." })
    } catch (e: any) {
      console.error("Generate invite error:", e)
      toast({ title: "Gagal", description: e?.message || "Gagal membuat undangan", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const copy = async () => {
    try {
      if (!inviteUrl) return
      await navigator.clipboard.writeText(inviteUrl)
      toast({ title: "Disalin", description: "Link undangan telah disalin ke clipboard." })
    } catch {
      toast({ title: "Gagal menyalin", description: "Salin manual dari input di atas.", variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Undang ke {group?.name || "Grup"}</DialogTitle>
          <DialogDescription>Buat dan bagikan link undangan untuk menambahkan anggota ke grup ini.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Peran saat bergabung</Label>
            <Select value={role} onValueChange={(v) => setRole(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Link Undangan</Label>
            <div className="flex gap-2">
              <Input value={inviteUrl} readOnly placeholder="Klik 'Generate' untuk membuat link" />
              <Button type="button" onClick={copy} disabled={!inviteUrl}>
                Salin
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button onClick={generate} disabled={isGenerating || !group || !currentUser}>
            {isGenerating ? "Membuat..." : token ? "Generate Ulang" : "Generate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
