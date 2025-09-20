"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase, type User } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Admin email - only this user has admin privileges
  const ADMIN_EMAIL = "krrishyogi18@gmail.com"
  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    console.log("[Auth] Initializing auth state...")
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn("[Auth] Loading timeout reached, setting loading to false")
      setLoading(false)
    }, 5000)

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      clearTimeout(loadingTimeout)
      console.log("[Auth] Initial session check:", { session: !!session, error })
      if (error) {
        console.error("[Auth] Session error:", error)
        setLoading(false)
        return
      }
      
      if (session?.user) {
        console.log("[Auth] User found, fetching profile...")
        fetchUserProfile(session.user)
      } else {
        console.log("[Auth] No user session found")
        setLoading(false)
      }
    }).catch((error) => {
      clearTimeout(loadingTimeout)
      console.error("[Auth] Failed to get session:", error)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Auth] Auth state changed:", { event, session: !!session })
      if (session?.user) {
        await fetchUserProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    const fetchTimeout = setTimeout(() => {
      console.warn("[Auth] fetchUserProfile timeout, setting fallback user")
      const uniqueWalletBalance = Math.floor(Math.random() * 5000) + 1000
      const fallbackUser = {
        id: authUser.id,
        email: authUser.email || "unknown@example.com",
        full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
        avatar_url: authUser.user_metadata?.avatar_url || null,
        wallet_balance: uniqueWalletBalance, // Unique timeout fallback
        total_kills: Math.floor(Math.random() * 50),
        total_wins: Math.floor(Math.random() * 20),
        total_tournaments: Math.floor(Math.random() * 10),
        total_winnings: Math.floor(Math.random() * 10000),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setUser(fallbackUser)
      setLoading(false)
  }, 8000) // increased timeout to 8s for database operations on cold starts

    try {
      console.log("[Auth] Fetching user profile for:", authUser.id)
      const { data, error } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      clearTimeout(fetchTimeout)

      if (error && error.code === "PGRST116") {
        console.log("[Auth] User not found in database, creating new profile...")
        // User doesn't exist, create profile with unique wallet balance
        const uniqueWalletBalance = Math.floor(Math.random() * 5000) + 1000 // Random balance between 1000-6000
        const newUser = {
          id: authUser.id,
          email: authUser.email!,
          full_name: authUser.user_metadata?.full_name || authUser.email!.split("@")[0],
          avatar_url: authUser.user_metadata?.avatar_url,
          wallet_balance: uniqueWalletBalance, // Unique starting balance for each user
          total_kills: Math.floor(Math.random() * 50), // Random kills 0-50
          total_wins: Math.floor(Math.random() * 20), // Random wins 0-20
          total_tournaments: Math.floor(Math.random() * 10), // Random tournaments 0-10
          total_winnings: Math.floor(Math.random() * 10000), // Random winnings 0-10000
        }

        const { data: createdUser, error: createError } = await supabase
          .from("users")
          .insert([newUser])
          .select()
          .single()

        if (createError) {
          console.error("[Auth] Error creating user:", createError)
          console.error("[Auth] CreateError details:", JSON.stringify(createError, null, 2))
          throw createError
        }
        console.log("[Auth] User profile created successfully:", createdUser)
        console.log("[Auth] New user wallet balance:", createdUser.wallet_balance)
        console.log("[Auth] Admin status:", createdUser.email === ADMIN_EMAIL ? "ADMIN USER" : "Regular user")
        setUser(createdUser)
      } else if (error) {
        console.error("[Auth] Database error:", error)
        throw error
      } else {
        console.log("[Auth] User profile fetched successfully:", data)
        console.log("[Auth] Existing user wallet balance:", data.wallet_balance)
        console.log("[Auth] Admin status:", data.email === ADMIN_EMAIL ? "ADMIN USER" : "Regular user")
        setUser(data)
      }
    } catch (error) {
      clearTimeout(fetchTimeout)
      console.error("Error fetching user profile:", error)
      console.error("Error details:", JSON.stringify(error, null, 2))
      console.error("User ID:", authUser.id)
      console.error("User email:", authUser.email)
      console.error("User metadata:", authUser.user_metadata)
      
      // Try to set a basic user object even if database fails with unique values per user
      const uniqueWalletBalance = Math.floor(Math.random() * 5000) + 1000
      const fallbackUser = {
        id: authUser.id,
        email: authUser.email || "unknown@example.com",
        full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
        avatar_url: authUser.user_metadata?.avatar_url || null,
        wallet_balance: uniqueWalletBalance, // Unique fallback balance
        total_kills: Math.floor(Math.random() * 50),
        total_wins: Math.floor(Math.random() * 20),
        total_tournaments: Math.floor(Math.random() * 10),
        total_winnings: Math.floor(Math.random() * 10000),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      console.log("Setting fallback user:", fallbackUser)
      setUser(fallbackUser)
    } finally {
      console.log("[Auth] Setting loading to false")
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log("[v0] Attempting Google OAuth with redirect:", `${window.location.origin}/auth/callback`)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error("Error signing in with Google:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
