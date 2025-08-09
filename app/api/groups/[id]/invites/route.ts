import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

function randomToken(): string {
  // Generate token 32 karakter hex
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("")
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}))
    const { role = "member", createdBy } = body
    const groupId = params.id

    console.log("API: /api/groups/[id]/invites POST request received.")
    console.log("API: Request body:", { role, createdBy, groupId })

    if (!groupId) {
      console.error("API: Missing group id")
      return NextResponse.json({ ok: false, error: "Missing group id" }, { status: 400 })
    }

    if (!createdBy) {
      console.error("API: Missing createdBy (user ID)")
      return NextResponse.json({ ok: false, error: "Missing createdBy" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const token = randomToken()

    console.log("API: Attempting to insert invite into Supabase:", { token, groupId, role, createdBy })

    const { data, error } = await supabase.from("invites").insert({
      token,
      group_id: groupId,
      role,
      created_by: createdBy,
    }).select().single()

    if (error) {
      console.error("API: Supabase insert error:", error)
      throw error
    }

    console.log("API: Invite successfully created:", data)

    return NextResponse.json({ ok: true, token: data.token })
  } catch (e: any) {
    console.error("API: General error during invite creation:", e)
    return NextResponse.json({ 
      ok: false, 
      error: e?.message || "Failed to create invite" 
    }, { status: 500 })
  }
}
