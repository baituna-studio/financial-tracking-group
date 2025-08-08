"use client"

import { useState, useEffect } from "react"
import { Plus, Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MainLayout } from "@/components/layout/main-layout"
import { BudgetModal } from "@/components/modals/budget-modal"
import { ExpenseModal } from "@/components/modals/expense-modal"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { formatCurrency, formatDate, getMonthRange, exportToExcel } from "@/lib/utils"

export default function FinancePage() {
  const [budgets, setBudgets] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  useEffect(() => {
    loadFinanceData()
  }, [selectedMonth])

  const loadFinanceData = async () => {
    setIsLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) return

      const [year, month] = selectedMonth.split("-").map(Number)
      const { start, end } = getMonthRange(year, month)

      // Get user's groups
      const { data: userGroups } = await supabase.from("user_groups").select("group_id").eq("user_id", user.id)

      const groupIds = userGroups?.map((ug) => ug.group_id) || []

      // Load budgets
      const { data: budgetsData } = await supabase
        .from("budgets")
        .select(`
          *,
          categories(name, color),
          groups(name)
        `)
        .in("group_id", groupIds)
        .lte("start_date", end)
        .gte("end_date", start)
        .order("created_at", { ascending: false })

      // Load expenses
      const { data: expensesData } = await supabase
        .from("expenses")
        .select(`
          *,
          categories(name, color),
          groups(name),
          profiles(full_name)
        `)
        .in("group_id", groupIds)
        .gte("expense_date", start)
        .lte("expense_date", end)
        .order("expense_date", { ascending: false })

      setBudgets(budgetsData || [])
      setExpenses(expensesData || [])
    } catch (error) {
      console.error("Error loading finance data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportExpenses = () => {
    const exportData = expenses.map((expense) => ({
      Tanggal: expense.expense_date,
      Judul: expense.title,
      Deskripsi: expense.description || "",
      Kategori: expense.categories?.name || "Lainnya",
      Grup: expense.groups?.name || "",
      Jumlah: expense.amount,
      "Dibuat oleh": expense.profiles?.full_name || "",
    }))

    exportToExcel(exportData, `Pengeluaran-${selectedMonth}`)
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
            <h1 className="text-2xl font-bold text-gray-900">Keuangan</h1>
            <p className="text-gray-600">Kelola budget dan pengeluaran Anda</p>
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
            <Button onClick={handleExportExpenses} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => setIsBudgetModalOpen(true)} className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Budget
          </Button>
          <Button onClick={() => setIsExpenseModalOpen(true)} variant="outline" className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pengeluaran
          </Button>
        </div>

        {/* Budgets Section */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Bulan Ini</CardTitle>
            <CardDescription>Daftar budget yang aktif untuk periode yang dipilih</CardDescription>
          </CardHeader>
          <CardContent>
            {budgets.length > 0 ? (
              <div className="space-y-4">
                {budgets.map((budget) => (
                  <div key={budget.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: budget.categories?.color || "#6B7280" }}
                      />
                      <div>
                        <h4 className="font-medium">{budget.title}</h4>
                        <p className="text-sm text-gray-600">
                          {budget.categories?.name} • {budget.groups?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{formatCurrency(budget.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada budget untuk bulan ini</p>
                <Button onClick={() => setIsBudgetModalOpen(true)} variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Budget Pertama
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses Section */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pengeluaran</CardTitle>
            <CardDescription>Semua pengeluaran untuk periode yang dipilih</CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Grup</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{formatDate(expense.expense_date)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{expense.title}</p>
                            {expense.description && <p className="text-sm text-gray-600">{expense.description}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: expense.categories?.color || "#6B7280" }}
                            />
                            <span>{expense.categories?.name || "Lainnya"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{expense.groups?.name || "Tidak ada grup"}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada pengeluaran untuk bulan ini</p>
                <Button onClick={() => setIsExpenseModalOpen(true)} variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Pengeluaran Pertama
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <BudgetModal
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
          onSuccess={loadFinanceData}
        />
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          onSuccess={loadFinanceData}
        />
      </div>
    </MainLayout>
  )
}
