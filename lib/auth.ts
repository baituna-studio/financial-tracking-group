import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import { createDefaultGroup } from "./database-setup"

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })
  if (error) throw error

  // Create profile and default setup after sign up
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email: data.user.email!,
      full_name: fullName,
    })
    if (profileError) throw profileError

    // Create default group and categories (best-effort)
    try {
      await createDefaultGroup(data.user.id, data.user.email!)
    } catch (e) {
      console.warn("Default setup error:", e)
    }
  }
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  
  // Clear any local storage or session data if needed
  if (typeof window !== 'undefined') {
    localStorage.clear()
    sessionStorage.clear()
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
  if (error) throw error
  return data
}
