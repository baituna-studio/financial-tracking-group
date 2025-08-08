import { supabase } from "./supabase"

export async function checkDatabaseSetup() {
  try {
    // Check if tables exist by trying to query them
    const { data, error } = await supabase.from("profiles").select("id").limit(1)

    if (error && error.code === "42P01") {
      // Table doesn't exist
      return false
    }

    return true
  } catch (error) {
    console.error("Database setup check failed:", error)
    return false
  }
}

export async function createDefaultGroup(userId: string, userEmail: string) {
  try {
    // Create a default group for the user
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name: "Grup Pribadi",
        description: "Grup keuangan pribadi",
        created_by: userId,
      })
      .select()
      .single()

    if (groupError) throw groupError

    // Add user to the group as admin
    const { error: memberError } = await supabase.from("user_groups").insert({
      user_id: userId,
      group_id: group.id,
      role: "admin",
    })

    if (memberError) throw memberError

    // Create default categories for the group
    const defaultCategories = [
      { name: "Makanan & Minuman", icon: "utensils", color: "#EF4444" },
      { name: "Listrik & Utilities", icon: "zap", color: "#F59E0B" },
      { name: "Pendidikan", icon: "graduation-cap", color: "#3B82F6" },
      { name: "Transportasi", icon: "car", color: "#10B981" },
      { name: "Kesehatan", icon: "heart", color: "#EC4899" },
      { name: "Hiburan", icon: "gamepad-2", color: "#8B5CF6" },
      { name: "Belanja", icon: "shopping-bag", color: "#F97316" },
      { name: "Lainnya", icon: "more-horizontal", color: "#6B7280" },
    ]

    const { error: categoriesError } = await supabase.from("categories").insert(
      defaultCategories.map((cat) => ({
        ...cat,
        group_id: group.id,
        created_by: userId,
      })),
    )

    if (categoriesError) throw categoriesError

    return group
  } catch (error) {
    console.error("Error creating default group:", error)
    throw error
  }
}
