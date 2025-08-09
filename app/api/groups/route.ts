import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(req: Request) {
  try {
    const { name, description, createdBy } = await req.json()

    if (!name || !createdBy) {
      return NextResponse.json({ ok: false, error: "Nama grup dan ID pembuat diperlukan" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // 1. Buat grup baru
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name,
        description,
        created_by: createdBy,
      })
      .select()
      .single()

    if (groupError) {
      console.error("Error creating group:", groupError)
      throw groupError
    }

    // 2. Tambahkan pengguna yang membuat grup sebagai admin
    const { error: userGroupError } = await supabase.from("user_groups").insert({
      user_id: createdBy,
      group_id: group.id,
      role: "admin",
    })

    if (userGroupError) {
      console.error("Error adding user to group:", userGroupError)
      throw userGroupError
    }

    return NextResponse.json({ ok: true, group }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Gagal membuat grup" }, { status: 500 })
  }
}
