import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(req: Request) {
  try {
    const { token, userId } = await req.json()
    console.log("Accept invite request:", { token, userId })
    
    if (!token || !userId) {
      return NextResponse.json({ ok: false, error: "Missing token or userId" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const now = new Date().toISOString()

    // Cari invite yang valid
    const { data: invite, error: invErr } = await supabase
      .from("invites")
      .select("*")
      .eq("token", token)
      .gte("expires_at", now) // expires_at harus >= now (belum expired)
      .is("accepted_at", null) // belum pernah di-accept
      .single()

    console.log("Invite query result:", { invite, error: invErr })

    if (invErr || !invite) {
      console.error("Invalid invite:", invErr)
      return NextResponse.json({ 
        ok: false, 
        error: "Undangan tidak valid, sudah kadaluarsa, atau sudah terpakai" 
      }, { status: 400 })
    }

    // Cek apakah user sudah menjadi member
    const { data: existing, error: exErr } = await supabase
      .from("user_groups")
      .select("id, role")
      .eq("user_id", userId)
      .eq("group_id", invite.group_id)
      .maybeSingle()
    
    console.log("Existing membership:", { existing, error: exErr })
    
    if (exErr) {
      console.error("Error checking membership:", exErr)
      throw exErr
    }

    if (existing) {
      console.log("User already member, updating invite as accepted")
      // User sudah member, tapi tetap mark invite sebagai accepted
      const { error: updErr } = await supabase
        .from("invites")
        .update({ accepted_at: now, accepted_by: userId })
        .eq("id", invite.id)
      
      if (updErr) console.error("Error updating invite:", updErr)
      
      return NextResponse.json({ 
        ok: true, 
        groupId: invite.group_id,
        message: "Anda sudah menjadi anggota grup ini"
      })
    }

    // Tambahkan user ke grup
    console.log("Adding user to group:", { userId, groupId: invite.group_id, role: invite.role })
    
    const { error: addErr } = await supabase.from("user_groups").insert({
      user_id: userId,
      group_id: invite.group_id,
      role: invite.role || "member",
    })
    
    if (addErr) {
      console.error("Error adding user to group:", addErr)
      throw addErr
    }

    // Tandai invite sebagai accepted
    const { error: updErr } = await supabase
      .from("invites")
      .update({ accepted_at: now, accepted_by: userId })
      .eq("id", invite.id)
    
    if (updErr) {
      console.error("Error updating invite:", updErr)
      // Don't throw here, user sudah ditambahkan ke grup
    }

    console.log("Successfully accepted invite")
    return NextResponse.json({ 
      ok: true, 
      groupId: invite.group_id,
      message: "Berhasil bergabung ke grup"
    })
    
  } catch (e: any) {
    console.error("Accept invite error:", e)
    return NextResponse.json({ 
      ok: false, 
      error: e?.message || "Failed to accept invite" 
    }, { status: 500 })
  }
}
