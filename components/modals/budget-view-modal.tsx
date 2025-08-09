"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"

interface BudgetViewModalProps {
  isOpen: boolean
  onClose: () => void
  budget: any | null
}

export function BudgetViewModal({ isOpen, onClose, budget }: BudgetViewModalProps) {
  const categoryName = budget?.categories?.name || "Lainnya"
  const categoryColor = budget?.categories?.color || "#6B7280"
  const groupName = budget?.groups?.name || "Tanpa grup"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Detail Budget</DialogTitle>
          <DialogDescription>Informasi lengkap budget terpilih.</DialogDescription>
        </DialogHeader>
        {budget && (
          <div className="grid gap-4">
            <div className="grid gap-1">
              <Label>Judul</Label>
              <div className="font-medium">{budget.title}</div>
            </div>

            <div className="grid gap-1">
              <Label>Jumlah</Label>
              <div className="font-semibold">{formatCurrency(budget.amount)}</div>
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
              <div className="text-sm text-gray-700">
                {formatDate(budget.start_date)}
                {budget.end_date && budget.end_date !== budget.start_date
                  ? ` - ${formatDate(budget.end_date)}`
                  : ""}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
