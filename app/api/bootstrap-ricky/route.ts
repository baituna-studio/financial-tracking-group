import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST() {
  try {
    const email = 'ricky@gmail.com'
    const password = 'ricky@gmail.com'
    const fullName = 'Ricky'

    const supabaseAdmin = getSupabaseAdmin()

    // 1) Try to create the user (auto-confirm)
    let userId: string | null = null
    try {
      const { data, error } = await (supabaseAdmin as any).auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      })
      if (error) throw error
      userId = data.user?.id ?? null
    } catch (err: any) {
      // If user already exists, we will sign in to fetch the id next
    }

    // 2) If userId unknown, sign in with anon client to get user data
    if (!userId) {
      const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!url || !anonKey) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
      }
      const supabaseAnon = createClient(url, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password })
      if (error) throw error
      userId = data.user?.id ?? null
    }

    if (!userId) {
      throw new Error('Unable to resolve user id for Ricky')
    }

    // 3) Ensure profile exists
    {
      const { error } = await supabaseAdmin
        .from('profiles')
        .upsert(
          {
            id: userId,
            email,
            full_name: fullName,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' },
        )
      if (error) throw error
    }

    // 4) Ensure a group and membership exist
    // Check existing membership
    const { data: existingMemberships, error: memErr } = await supabaseAdmin
      .from('user_groups')
      .select('group_id')
      .eq('user_id', userId)

    if (memErr) throw memErr

    let groupId = existingMemberships?.[0]?.group_id as string | undefined

    if (!groupId) {
      groupId = crypto.randomUUID()

      // Create group
      const { error: groupErr } = await supabaseAdmin.from('groups').upsert(
        {
          id: groupId,
          name: 'Grup Ricky',
          description: 'Grup keuangan pribadi Ricky',
          created_by: userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      if (groupErr) throw groupErr

      // Create membership
      const { error: ugErr } = await supabaseAdmin
        .from('user_groups')
        .upsert(
          { user_id: userId, group_id: groupId, role: 'admin' },
          { onConflict: 'user_id,group_id' },
        )
      if (ugErr) throw ugErr
    }

    // 5) Ensure default categories exist for this group
    const defaultCategories = [
      { name: 'Makanan & Minuman', icon: 'utensils', color: '#EF4444' },
      { name: 'Listrik & Utilities', icon: 'zap', color: '#F59E0B' },
      { name: 'Pendidikan', icon: 'graduation-cap', color: '#3B82F6' },
      { name: 'Transportasi', icon: 'car', color: '#10B981' },
      { name: 'Kesehatan', icon: 'heart', color: '#EC4899' },
      { name: 'Hiburan', icon: 'gamepad-2', color: '#8B5CF6' },
      { name: 'Belanja', icon: 'shopping-bag', color: '#F97316' },
      { name: 'Lainnya', icon: 'more-horizontal', color: '#6B7280' },
    ]

    // Check existing categories count for this group
    const { count, error: countErr } = await supabaseAdmin
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)

    if (countErr) throw countErr

    if (!count || count === 0) {
      const payload = defaultCategories.map((c) => ({
        ...c,
        group_id: groupId!,
        created_by: userId!,
      }))
      const { error: catErr } = await supabaseAdmin.from('categories').insert(payload)
      if (catErr) throw catErr
    }

    return NextResponse.json({ ok: true, userId, groupId }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Unknown error' }, { status: 500 })
  }
}
