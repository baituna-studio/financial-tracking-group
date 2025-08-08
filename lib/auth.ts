import type { User } from "@supabase/supabase-js"
import { MOCK_USER, MOCK_PROFILE } from "./mock-auth"

// Mock authentication - bypass Supabase for demo
const USE_MOCK_AUTH = true

export async function signUp(email: string, password: string, fullName: string) {
  if (USE_MOCK_AUTH) {
    // Simulate successful signup
    return { user: MOCK_USER, session: null }
  }
  
  // Original Supabase code would go here
  throw new Error("Supabase signup not implemented in mock mode")
}

export async function signIn(email: string, password: string) {
  if (USE_MOCK_AUTH) {
    // Accept any login for demo purposes, but prefer the demo credentials
    if (email === "ricky@gmail.com" && password === "ricky@gmail.com") {
      return { user: MOCK_USER, session: { access_token: "mock-token" } }
    }
    // For demo, accept any credentials
    return { user: MOCK_USER, session: { access_token: "mock-token" } }
  }
  
  // Original Supabase code would go here
  throw new Error("Supabase signin not implemented in mock mode")
}

export async function signOut() {
  if (USE_MOCK_AUTH) {
    // Simulate successful signout
    return
  }
  
  // Original Supabase code would go here
  throw new Error("Supabase signout not implemented in mock mode")
}

export async function getCurrentUser(): Promise<User | null> {
  if (USE_MOCK_AUTH) {
    return MOCK_USER as User
  }
  
  // Original Supabase code would go here
  return null
}

export async function getUserProfile(userId: string) {
  if (USE_MOCK_AUTH) {
    return MOCK_PROFILE
  }
  
  // Original Supabase code would go here
  throw new Error("Supabase getUserProfile not implemented in mock mode")
}
