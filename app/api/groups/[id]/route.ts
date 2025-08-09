import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name, description } = await req.json()
    const groupId = params.id

    if (!name) {
      return NextResponse.json({ ok: false, error: "Nama grup diperlukan" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from("groups")
      .update({
        name,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", groupId)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Gagal memperbarui grup" }, { status: 500 })
  }
}
