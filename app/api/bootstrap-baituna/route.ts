import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST() {
  try {
    const email = "baituna.studio@gmail.com"
    const password = "baituna.studio@gmail.com"
    const fullName = "Baituna Studio"

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
        console.log("Baituna Studio user already exists, updating password...")

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
        console.log("Creating new Baituna Studio user...")
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
      throw new Error("Unable to resolve user id for Baituna Studio")
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

    // 4) Cari grup Rochiyat dengan lebih robust
    let rochiyatGroupId: string | null = null

    // Pertama, cari berdasarkan nama grup
    const { data: rochiyatGroups, error: groupErr } = await supabaseAdmin
      .from("groups")
      .select("id, name, created_by")
      .eq("name", "Grup Rochiyat")
      .limit(1)

    if (groupErr) throw groupErr

    if (rochiyatGroups && rochiyatGroups.length > 0) {
      rochiyatGroupId = rochiyatGroups[0].id
      console.log("Found Grup Rochiyat by name:", rochiyatGroupId)
    } else {
      // Jika tidak ditemukan berdasarkan nama, cari user Rochiyat dan ambil grupnya
      console.log("Grup Rochiyat not found by name, searching by Rochiyat user...")

      const { data: rochiyatProfile, error: profileErr } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", "rochiyat@gmail.com")
        .single()

      if (profileErr || !rochiyatProfile) {
        throw new Error(
          "User Rochiyat tidak ditemukan. Pastikan user Rochiyat sudah dibuat terlebih dahulu dengan bootstrap-rochiyat.",
        )
      }

      // Cari grup yang dibuat oleh Rochiyat atau dimana Rochiyat adalah admin
      const { data: rochiyatUserGroups, error: ugErr } = await supabaseAdmin
        .from("user_groups")
        .select("group_id, groups(id, name, created_by)")
        .eq("user_id", rochiyatProfile.id)
        .eq("role", "admin")

      if (ugErr) throw ugErr

      if (rochiyatUserGroups && rochiyatUserGroups.length > 0) {
        // Ambil grup pertama yang ditemukan
        rochiyatGroupId = rochiyatUserGroups[0].group_id
        console.log("Found Rochiyat's group:", rochiyatGroupId)

        // Update nama grup menjadi "Grup Rochiyat" jika belum
        const { error: updateGroupErr } = await supabaseAdmin
          .from("groups")
          .update({ name: "Grup Rochiyat", updated_at: new Date().toISOString() })
          .eq("id", rochiyatGroupId)

        if (updateGroupErr) console.warn("Could not update group name:", updateGroupErr)
      } else {
        throw new Error(
          "Tidak dapat menemukan grup milik Rochiyat. Pastikan Rochiyat sudah memiliki grup dengan menjalankan bootstrap-rochiyat terlebih dahulu.",
        )
      }
    }

    if (!rochiyatGroupId) {
      throw new Error("Grup Rochiyat tidak ditemukan")
    }

    // 5) Tambahkan Baituna Studio ke grup Rochiyat
    // Cek apakah sudah menjadi member
    const { data: existingMembership, error: memCheckErr } = await supabaseAdmin
      .from("user_groups")
      .select("id, role")
      .eq("user_id", userId)
      .eq("group_id", rochiyatGroupId)
      .maybeSingle()

    if (memCheckErr) throw memCheckErr

    if (existingMembership) {
      console.log("Baituna Studio already member of Grup Rochiyat")
    } else {
      console.log("Adding Baituna Studio to Grup Rochiyat...")
      // Tambahkan sebagai member baru
      const { error: addMemberErr } = await supabaseAdmin.from("user_groups").insert({
        user_id: userId,
        group_id: rochiyatGroupId,
        role: "member",
        joined_at: new Date().toISOString(),
      })

      if (addMemberErr) throw addMemberErr
    }

    // 6) Create some sample expenses for Baituna Studio in the shared group
    await createBaitunaExpenses(supabaseAdmin, userId, rochiyatGroupId)

    // 7) Verify shared data access by counting shared resources
    const { count: categoriesCount } = await supabaseAdmin
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("group_id", rochiyatGroupId)

    const { count: budgetsCount } = await supabaseAdmin
      .from("budgets")
      .select("*", { count: "exact", head: true })
      .eq("group_id", rochiyatGroupId)

    const { count: expensesCount } = await supabaseAdmin
      .from("expenses")
      .select("*", { count: "exact", head: true })
      .eq("group_id", rochiyatGroupId)

    return NextResponse.json(
      {
        ok: true,
        userId,
        groupId: rochiyatGroupId,
        message: userExists
          ? "User Baituna Studio updated and added to Grup Rochiyat"
          : "User Baituna Studio created and added to Grup Rochiyat",
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
    console.error("Bootstrap Baituna Studio error:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function createBaitunaExpenses(supabaseAdmin: any, userId: string, groupId: string) {
  try {
    // Get categories for sample data
    const { data: categories } = await supabaseAdmin.from("categories").select("id, name, type").eq("group_id", groupId)

    if (!categories || categories.length === 0) {
      console.log("No categories found for group, skipping sample expenses")
      return
    }

    const expenseCategories = categories.filter((c: any) => c.type === "Pengeluaran")

    // Check if Baituna already has expenses in this group
    const { count: existingExpenses } = await supabaseAdmin
      .from("expenses")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId)
      .eq("created_by", userId)

    if (existingExpenses && existingExpenses > 0) {
      console.log("Baituna Studio already has expenses in this group, skipping sample creation")
      return
    }

    // Create sample expenses for Baituna Studio
    const sampleExpenses = [
      { categoryName: "Makanan & Minuman", title: "Coffee meeting dengan klien", amount: 120000, daysAgo: 1 },
      { categoryName: "Transportasi", title: "Grab ke lokasi shooting", amount: 45000, daysAgo: 2 },
      { categoryName: "Belanja", title: "Beli equipment studio", amount: 850000, daysAgo: 3 },
      { categoryName: "Hiburan", title: "Team building dinner", amount: 300000, daysAgo: 5 },
      { categoryName: "Lainnya", title: "Biaya admin bank", amount: 15000, daysAgo: 7 },
      { categoryName: "Makanan & Minuman", title: "Catering untuk tim", amount: 200000, daysAgo: 4 },
    ]

    for (const expense of sampleExpenses) {
      const category = expenseCategories.find((c: any) => c.name === expense.categoryName)
      if (category) {
        const expenseDate = new Date()
        expenseDate.setDate(expenseDate.getDate() - expense.daysAgo)

        await supabaseAdmin.from("expenses").insert({
          title: expense.title,
          description: `Pengeluaran Baituna Studio untuk ${expense.categoryName}`,
          amount: expense.amount,
          category_id: category.id,
          group_id: groupId,
          expense_date: expenseDate.toISOString().split("T")[0],
          created_by: userId,
        })
      }
    }

    console.log("Baituna Studio sample expenses created successfully")
  } catch (error) {
    console.error("Error creating Baituna Studio sample expenses:", error)
    // Don't throw error, just log it
  }
}
