import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const targetEmails = ["rochiyat@gmail.com", "baituna.studio@gmail.com"]
    const results = []

    // Check auth.users
    const { data: authUsers, error: authError } = await (supabaseAdmin as any).auth.admin.listUsers()
    if (authError) throw authError

    for (const email of targetEmails) {
      const authUser = authUsers.users?.find((u: any) => u.email === email)

      let profileData = null
      let groupMemberships = []

      if (authUser) {
        // Check profile
        const { data: profile, error: profileError } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle()

        if (!profileError && profile) {
          profileData = profile

          // Check group memberships
          const { data: memberships, error: memberError } = await supabaseAdmin
            .from("user_groups")
            .select(`
              role,
              joined_at,
              groups(id, name, description)
            `)
            .eq("user_id", authUser.id)

          if (!memberError && memberships) {
            groupMemberships = memberships
          }
        }
      }

      results.push({
        email,
        exists: !!authUser,
        authUser: authUser
          ? {
              id: authUser.id,
              email: authUser.email,
              created_at: authUser.created_at,
              email_confirmed_at: authUser.email_confirmed_at,
              user_metadata: authUser.user_metadata,
            }
          : null,
        profile: profileData,
        groupMemberships,
      })
    }

    // Check if "Grup Rochiyat" exists
    const { data: rochiyatGroup, error: groupError } = await supabaseAdmin
      .from("groups")
      .select("*")
      .eq("name", "Grup Rochiyat")
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      users: results,
      grupRochiyat: rochiyatGroup,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Check users error:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
