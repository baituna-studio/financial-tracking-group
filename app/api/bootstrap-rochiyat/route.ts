import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST() {
  try {
    const email = "rochiyat@gmail.com"
    const password = "rochiyat@gmail.com"
    const fullName = "Rochiyat"

    const supabaseAdmin = getSupabaseAdmin()

    // 1) Cek apakah user sudah ada
    let userId: string | null = null
    let userExists = false

    try {
      // Coba cari user berdasarkan email
      const { data: existingUsers, error: listError } = await (supabaseAdmin as any).auth.admin.listUsers()
      if (listError) throw listError

      const existingUser = existingUsers.users?.find((u: any) => u.email === email)

      if (existingUser) {
        userExists = true
        userId = existingUser.id
        console.log("User already exists, updating password...")

        // Update password user yang sudah ada
        const { error: updateError } = await (supabaseAdmin as any).auth.admin.updateUserById(userId, {
          password: password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        })
        if (updateError) throw updateError
      }
    } catch (err: any) {
      console.log("Error checking existing user:", err.message)
    }

    // 2) Jika user belum ada, buat user baru
    if (!userExists) {
      try {
        console.log("Creating new user...")
        const { data, error } = await (supabaseAdmin as any).auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        })
        if (error) throw error
        userId = data.user?.id ?? null
      } catch (err: any) {
        console.error("Error creating user:", err)
        throw err
      }
    }

    if (!userId) {
      throw new Error("Unable to resolve user id for Rochiyat")
    }

    // 3) Ensure profile exists/updated
    {
      const { error } = await supabaseAdmin.from("profiles").upsert(
        {
          id: userId,
          email,
          full_name: fullName,
          month_start_day: 1, // Default month start day
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      if (error) throw error
    }

    // 4) Ensure a group and membership exist
    // Check existing membership
    const { data: existingMemberships, error: memErr } = await supabaseAdmin
      .from("user_groups")
      .select("group_id, groups(id, name)")
      .eq("user_id", userId)

    if (memErr) throw memErr

    let groupId = existingMemberships?.[0]?.group_id as string | undefined

    if (!groupId) {
      groupId = crypto.randomUUID()

      // Create group dengan nama yang konsisten
      const { error: groupErr } = await supabaseAdmin.from("groups").upsert(
        {
          id: groupId,
          name: "Grup Rochiyat", // Nama yang konsisten
          description: "Grup keuangan pribadi Rochiyat",
          created_by: userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      if (groupErr) throw groupErr

      // Create membership
      const { error: ugErr } = await supabaseAdmin
        .from("user_groups")
        .upsert({ user_id: userId, group_id: groupId, role: "admin" }, { onConflict: "user_id,group_id" })
      if (ugErr) throw ugErr
    } else {
      // Update existing group name to be consistent
      const { error: updateGroupErr } = await supabaseAdmin
        .from("groups")
        .update({ name: "Grup Rochiyat", updated_at: new Date().toISOString() })
        .eq("id", groupId)

      if (updateGroupErr) console.warn("Could not update group name:", updateGroupErr)
    }

    // 5) Ensure default categories exist for this group
    const defaultCategories = [
      { name: "Makanan & Minuman", icon: "utensils", color: "#EF4444", type: "Pengeluaran" },
      { name: "Listrik & Utilities", icon: "zap", color: "#F59E0B", type: "Pengeluaran" },
      { name: "Pendidikan", icon: "graduation-cap", color: "#3B82F6", type: "Pengeluaran" },
      { name: "Transportasi", icon: "car", color: "#10B981", type: "Pengeluaran" },
      { name: "Kesehatan", icon: "heart", color: "#EC4899", type: "Pengeluaran" },
      { name: "Hiburan", icon: "gamepad-2", color: "#8B5CF6", type: "Pengeluaran" },
      { name: "Belanja", icon: "shopping-bag", color: "#F97316", type: "Pengeluaran" },
      { name: "Gaji", icon: "briefcase", color: "#059669", type: "Pemasukan" },
      { name: "Bonus", icon: "gift", color: "#0891B2", type: "Pemasukan" },
      { name: "Lainnya", icon: "more-horizontal", color: "#6B7280", type: "Pengeluaran" },
    ]

    // Check existing categories count for this group
    const { count, error: countErr } = await supabaseAdmin
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId)

    if (countErr) throw countErr

    if (!count || count === 0) {
      const payload = defaultCategories.map((c) => ({
        ...c,
        group_id: groupId!,
        created_by: userId!,
      }))
      const { error: catErr } = await supabaseAdmin.from("categories").insert(payload)
      if (catErr) throw catErr
    }

    // 6) Create some sample data
    await createSampleData(supabaseAdmin, userId, groupId)

    // 7) Count shared resources for verification
    const { count: categoriesCount } = await supabaseAdmin
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId)

    const { count: budgetsCount } = await supabaseAdmin
      .from("budgets")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId)

    const { count: expensesCount } = await supabaseAdmin
      .from("expenses")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId)

    return NextResponse.json(
      {
        ok: true,
        userId,
        groupId,
        message: userExists ? "User Rochiyat updated successfully" : "User Rochiyat created successfully",
        action: userExists ? "updated" : "created",
        sharedData: {
          categories: categoriesCount || 0,
          budgets: budgetsCount || 0,
          expenses: expensesCount || 0,
        },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Bootstrap Rochiyat error:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function createSampleData(supabaseAdmin: any, userId: string, groupId: string) {
  try {
    // Get categories for sample data
    const { data: categories } = await supabaseAdmin.from("categories").select("id, name, type").eq("group_id", groupId)

    if (!categories || categories.length === 0) return

    const expenseCategories = categories.filter((c: any) => c.type === "Pengeluaran")
    const incomeCategories = categories.filter((c: any) => c.type === "Pemasukan")

    // Create sample budgets for current month
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1
    const startDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`
    const endDate = new Date(currentYear, currentMonth, 0).toISOString().split("T")[0]

    // Check if budgets already exist
    const { count: existingBudgets } = await supabaseAdmin
      .from("budgets")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId)
      .eq("created_by", userId)

    if (!existingBudgets || existingBudgets === 0) {
      const sampleBudgets = [
        { categoryName: "Makanan & Minuman", amount: 2500000 },
        { categoryName: "Listrik & Utilities", amount: 800000 },
        { categoryName: "Transportasi", amount: 1200000 },
        { categoryName: "Hiburan", amount: 500000 },
      ]

      for (const budget of sampleBudgets) {
        const category = expenseCategories.find((c: any) => c.name === budget.categoryName)
        if (category) {
          await supabaseAdmin.from("budgets").insert({
            title: `Budget ${budget.categoryName} ${currentDate.toLocaleString("id-ID", { month: "long", year: "numeric" })}`,
            amount: budget.amount,
            category_id: category.id,
            group_id: groupId,
            start_date: startDate,
            end_date: endDate,
            created_by: userId,
          })
        }
      }
    }

    // Check if expenses already exist
    const { count: existingExpenses } = await supabaseAdmin
      .from("expenses")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId)
      .eq("created_by", userId)

    if (!existingExpenses || existingExpenses === 0) {
      // Create sample expenses
      const sampleExpenses = [
        { categoryName: "Makanan & Minuman", title: "Makan siang di restoran", amount: 85000, daysAgo: 1 },
        { categoryName: "Makanan & Minuman", title: "Belanja groceries", amount: 350000, daysAgo: 3 },
        { categoryName: "Transportasi", title: "Bensin motor", amount: 60000, daysAgo: 2 },
        { categoryName: "Listrik & Utilities", title: "Tagihan listrik", amount: 450000, daysAgo: 5 },
        { categoryName: "Hiburan", title: "Nonton bioskop", amount: 50000, daysAgo: 7 },
        { categoryName: "Kesehatan", title: "Beli obat", amount: 75000, daysAgo: 4 },
      ]

      for (const expense of sampleExpenses) {
        const category = expenseCategories.find((c: any) => c.name === expense.categoryName)
        if (category) {
          const expenseDate = new Date()
          expenseDate.setDate(expenseDate.getDate() - expense.daysAgo)

          await supabaseAdmin.from("expenses").insert({
            title: expense.title,
            description: `Sample expense untuk ${expense.categoryName}`,
            amount: expense.amount,
            category_id: category.id,
            group_id: groupId,
            expense_date: expenseDate.toISOString().split("T")[0],
            created_by: userId,
          })
        }
      }
    }

    console.log("Sample data created successfully")
  } catch (error) {
    console.error("Error creating sample data:", error)
    // Don't throw error, just log it
  }
}
