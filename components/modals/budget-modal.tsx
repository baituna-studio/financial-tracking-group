"use client"

import { useState, useEffect } from "react"
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
import { MOCK_CATEGORIES, MOCK_GROUP, addMockBudget } from "@/lib/mock-auth"

interface BudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BudgetModal({ isOpen, onClose, onSuccess }: BudgetModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const title = formData.get("title") as string
      const amount = Number.parseFloat(formData.get("amount") as string)
      const categoryId = formData.get("categoryId") as string
      const startDate = formData.get("startDate") as string
      const endDate = formData.get("endDate") as string

      // Add to mock data
      addMockBudget({
        title,
        amount,
        category_id: categoryId,
        group_id: MOCK_GROUP.id,
        start_date: startDate,
        end_date: endDate,
      })

      toast({
        title: "Budget berhasil ditambahkan",
        description: "Budget baru telah disimpan.",
      })

      onSuccess()
      onClose()
    } catch (error: any) {
      toast({
        title: "Gagal menambahkan budget",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Budget</DialogTitle>
          <DialogDescription>Buat budget baru untuk mengontrol pengeluaran Anda.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Judul Budget</Label>
              <Input id="title" name="title" placeholder="Contoh: Budget Makanan Januari" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <Input id="amount" name="amount" type="number" placeholder="1000000" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoryId">Kategori</Label>
              <Select name="categoryId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Tanggal Selesai</Label>
                <Input id="endDate" name="endDate" type="date" required />
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
