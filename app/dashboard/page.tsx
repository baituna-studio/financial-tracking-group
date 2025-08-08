"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wallet, TrendingUp, TrendingDown, Target, Calendar, Download } from 'lucide-react'
import { MainLayout } from "@/components/layout/main-layout"
import { formatCurrency, exportToExcel } from "@/lib/utils"
import { MOCK_BUDGETS, MOCK_EXPENSES, getMockBudgets, getMockExpenses } from "@/lib/mock-auth"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [dashboardData, setDashboardData] = useState({
    totalBudget: 0,
    totalExpenses: 0,
    remainingBudget: 0,
    expensesByCategory: [] as any[],
    recentExpenses: [] as any[],
  })

  useEffect(() => {
    loadDashboardData()
  }, [selectedMonth])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const budgets = getMockBudgets()
      const expenses = getMockExpenses()

      const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

      // Group expenses by category
      const expensesByCategory = expenses.reduce((acc: any[], expense) => {
        const categoryName = expense.categories?.name || "Lainnya"
        const categoryColor = expense.categories?.color || "#6B7280"

        const existing = acc.find((item) => item.category === categoryName)
        if (existing) {
          existing.amount += expense.amount
        } else {
          acc.push({
            category: categoryName,
            amount: expense.amount,
            color: categoryColor,
          })
        }
        return acc
      }, [])

      // Sort by amount descending
      expensesByCategory.sort((a, b) => b.amount - a.amount)

      setDashboardData({
        totalBudget,
        totalExpenses,
        remainingBudget: totalBudget - totalExpenses,
        expensesByCategory,
        recentExpenses: expenses.slice(0, 5),
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = () => {
    const exportData = dashboardData.recentExpenses.map((expense) => ({
      Judul: expense.title,
      Kategori: expense.categories?.name || "Lainnya",
      Jumlah: expense.amount,
      Tanggal: expense.expense_date,
    }))

    exportToExcel(exportData, `Laporan-Keuangan-${selectedMonth}`)
  }

  const months = [
    { value: "2024-01", label: "Januari 2024" },
    { value: "2024-02", label: "Februari 2024" },
    { value: "2024-03", label: "Maret 2024" },
    { value: "2024-04", label: "April 2024" },
    { value: "2024-05", label: "Mei 2024" },
    { value: "2024-06", label: "Juni 2024" },
    { value: "2024-07", label: "Juli 2024" },
    { value: "2024-08", label: "Agustus 2024" },
    { value: "2024-09", label: "September 2024" },
    { value: "2024-10", label: "Oktober 2024" },
    { value: "2024-11", label: "November 2024" },
    { value: "2024-12", label: "Desember 2024" },
  ]

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
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Ringkasan keuangan Anda</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleExportData} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalBudget)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(dashboardData.totalExpenses)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sisa Budget</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  dashboardData.remainingBudget >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(dashboardData.remainingBudget)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Persentase Terpakai</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.totalBudget > 0
                  ? `${Math.round((dashboardData.totalExpenses / dashboardData.totalBudget) * 100)}%`
                  : "0%"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Pengeluaran per Kategori</CardTitle>
              <CardDescription>Breakdown pengeluaran berdasarkan kategori</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.expensesByCategory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium">{item.category}</span>
                    </div>
                    <span className="text-sm font-bold">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                {dashboardData.expensesByCategory.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Belum ada pengeluaran bulan ini</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Pengeluaran Terbaru</CardTitle>
              <CardDescription>5 pengeluaran terakhir bulan ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentExpenses.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{expense.title}</p>
                      <p className="text-xs text-gray-500">
                        {expense.categories?.name || "Lainnya"} • {expense.expense_date}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-red-600">{formatCurrency(expense.amount)}</span>
                  </div>
                ))}
                {dashboardData.recentExpenses.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Belum ada pengeluaran bulan ini</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
