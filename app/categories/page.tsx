"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/layout/main-layout"
import { formatCurrency } from "@/lib/utils"
import { MOCK_CATEGORIES, MOCK_EXPENSES } from "@/lib/mock-auth"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 300))

      // Calculate expenses for each category
      const categoriesWithTotals = MOCK_CATEGORIES.map((category) => {
        const categoryExpenses = MOCK_EXPENSES.filter(expense => expense.category_id === category.id)
        return {
          ...category,
          totalExpenses: categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0),
          expenseCount: categoryExpenses.length,
        }
      })
      
      setCategories(categoriesWithTotals)
    } catch (error) {
      console.error("Error loading categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const categoryIcons = {
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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kategori</h1>
            <p className="text-gray-600">Kelola kategori pengeluaran Anda</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kategori
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                      style={{ backgroundColor: category.color }}
                    >
                      {categoryIcons[category.icon as keyof typeof categoryIcons] || "📁"}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription className="text-sm">{category.expenseCount} transaksi</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Pengeluaran:</span>
                    <Badge variant="secondary" className="font-semibold">
                      {formatCurrency(category.totalExpenses)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
