import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from("categories").delete().eq("id", params.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed to delete category" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const payload = await req.json()
    const allowed = ["name", "description", "icon", "color", "type", "group_id"]
    const update: Record<string, any> = {}
    for (const key of allowed) {
      if (key in payload) update[key] = payload[key]
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ ok: false, error: "No valid fields to update" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from("categories").update(update).eq("id", params.id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed to update category" }, { status: 500 })
  }
}
