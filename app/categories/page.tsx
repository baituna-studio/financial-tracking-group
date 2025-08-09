"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainLayout } from "@/components/layout/main-layout"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { CategoryAddModal } from "@/components/modals/category-add-modal"
import { CategoryEditModal } from "@/components/modals/category-edit-modal"
import { CategoryViewModal } from "@/components/modals/category-view-modal"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function CategoriesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [expensesByCategory, setExpensesByCategory] = useState<Record<string, { total: number; count: number }>>({})
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<any | null>(null)
  const [viewCategory, setViewCategory] = useState<any | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"Pengeluaran" | "Pemasukan">("Pengeluaran")
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<any | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) return

      // get user's groups
      const { data: userGroups, error: ugErr } = await supabase
        .from("user_groups")
        .select("group_id")
        .eq("user_id", user.id)
      if (ugErr) throw ugErr
      const groupIds = userGroups?.map((ug) => ug.group_id) || []

      // fetch categories for those groups
      const { data: categoriesData, error: cErr } = await supabase
        .from("categories")
        .select("*")
        .in("group_id", groupIds)
        .order("created_at", { ascending: false })
      if (cErr) throw cErr
      setCategories(categoriesData || [])

      // fetch expenses to compute totals by category (global, not per month)
      const { data: expensesData, error: eErr } = await supabase
        .from("expenses")
        .select("id, amount, category_id")
        .in("group_id", groupIds)
      if (eErr) throw eErr

      const map: Record<string, { total: number; count: number }> = {}
      for (const ex of expensesData || []) {
        const key = ex.category_id
        if (!map[key]) map[key] = { total: 0, count: 0 }
        map[key].total += Number(ex.amount || 0)
        map[key].count += 1
      }
      setExpensesByCategory(map)
    } catch (e) {
      console.error(e)
      toast({ title: "Gagal memuat kategori", description: "Silakan coba lagi.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (category: any) => {
    setPendingDeleteCategory(category)
  }

  const doDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || "Gagal menghapus kategori")
      toast({ title: "Kategori dihapus", description: "Kategori telah dihapus." })
      await loadData()
    } catch (e: any) {
      toast({ title: "Gagal menghapus kategori", description: e?.message || "Error", variant: "destructive" })
    } finally {
      setDeletingId(null)
      setPendingDeleteCategory(null)
    }
  }

  const iconMap: Record<string, string> = {
    utensils: "🍽️",
    zap: "⚡",
    "graduation-cap": "🎓",
    car: "🚗",
    heart: "❤️",
    "gamepad-2": "🎮",
    "shopping-bag": "🛍️",
    "more-horizontal": "📝",
    folder: "📁",
  }

  const incomeCategories = useMemo(() => categories.filter((c) => c.type === "Pemasukan"), [categories])
  const expenseCategories = useMemo(() => categories.filter((c) => c.type === "Pengeluaran"), [categories])

  const renderGrid = (items: any[]) => {
    if (items.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Belum ada kategori pada bagian ini</p>
            <Button onClick={() => setIsAddOpen(true)} variant="outline" className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kategori
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((category) => {
          const stats = expensesByCategory[category.id] || { total: 0, count: 0 }
          return (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                      style={{ backgroundColor: category.color }}
                      aria-hidden
                    >
                      {iconMap[category.icon as keyof typeof iconMap] || "📁"}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {category.type} • {stats.count} transaksi
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewCategory(category)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditCategory(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => handleDelete(category)}
                      disabled={deletingId === category.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {category.type === "Pengeluaran" ? "Total Pengeluaran" : "Total Pemasukan"}:
                    </span>
                    <Badge variant="secondary" className="font-semibold">
                      {formatCurrency(stats.total)}
                    </Badge>
                  </div>
                  {category.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">{category.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kategori</h1>
            <p className="text-gray-600">Kelola kategori pemasukan dan pengeluaran Anda</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kategori
          </Button>
        </div>

        {/* Tabs for Pemasukan/Pengeluaran */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto">
            <TabsTrigger value="Pengeluaran">Pengeluaran</TabsTrigger>
            <TabsTrigger value="Pemasukan">Pemasukan</TabsTrigger>
          </TabsList>
          <TabsContent value="Pengeluaran" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderGrid(expenseCategories)
            )}
          </TabsContent>
          <TabsContent value="Pemasukan" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderGrid(incomeCategories)
            )}
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CategoryAddModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={loadData} />
        <CategoryEditModal
          isOpen={!!editCategory}
          onClose={() => setEditCategory(null)}
          onSuccess={loadData}
          category={editCategory}
        />
        <CategoryViewModal isOpen={!!viewCategory} onClose={() => setViewCategory(null)} category={viewCategory} />
      </div>
      <AlertDialog open={!!pendingDeleteCategory} onOpenChange={(open) => !open && setPendingDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kategori "{pendingDeleteCategory?.name}"? Menghapus kategori dapat mempengaruhi data terkait. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDeleteCategory(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDeleteCategory && doDelete(pendingDeleteCategory.id)}
              disabled={deletingId === pendingDeleteCategory?.id}
            >
              {deletingId === pendingDeleteCategory?.id ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  )
}
