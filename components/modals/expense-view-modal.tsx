"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"

interface ExpenseViewModalProps {
  isOpen: boolean
  onClose: () => void
  expense: any | null
}

export function ExpenseViewModal({ isOpen, onClose, expense }: ExpenseViewModalProps) {
  const categoryName = expense?.categories?.name || "Lainnya"
  const categoryColor = expense?.categories?.color || "#6B7280"
  const groupName = expense?.groups?.name || "Tanpa grup"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Detail Pengeluaran</DialogTitle>
          <DialogDescription>Informasi lengkap pengeluaran terpilih.</DialogDescription>
        </DialogHeader>
        {expense && (
          <div className="grid gap-4">
            <div className="grid gap-1">
              <Label>Judul</Label>
              <div className="font-medium">{expense.title}</div>
            </div>

            {expense.description && (
              <div className="grid gap-1">
                <Label>Deskripsi</Label>
                <div className="text-sm text-gray-700">{expense.description}</div>
              </div>
            )}

            <div className="grid gap-1">
              <Label>Jumlah</Label>
              <div className="font-semibold text-red-600">{formatCurrency(expense.amount)}</div>
            </div>

            <div className="grid gap-1">
              <Label>Kategori</Label>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: categoryColor }} />
                <span>{categoryName}</span>
              </div>
            </div>

            <div className="grid gap-1">
              <Label>Grup</Label>
              <Badge variant="secondary">{groupName}</Badge>
            </div>

            <div className="grid gap-1">
              <Label>Tanggal</Label>
              <div className="text-sm text-gray-700">{formatDate(expense.expense_date)}</div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
