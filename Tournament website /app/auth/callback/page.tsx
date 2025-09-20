"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    console.log("[AuthCallback] Starting auth callback process...")
    
    // Add timeout to prevent infinite loading
    const callbackTimeout = setTimeout(() => {
      console.warn("[AuthCallback] Callback timeout, redirecting to home")
      router.push("/")
    }, 5000) // 5 second timeout

    const handleAuthCallback = async () => {
      try {
        console.log("[AuthCallback] Getting session...")
        const { data, error } = await supabase.auth.getSession()
        
        clearTimeout(callbackTimeout)
        
        if (error) {
          console.error("[AuthCallback] Session error:", error)
          throw error
        }

        console.log("[AuthCallback] Session data:", { hasSession: !!data.session })

        if (data.session) {
          console.log("[AuthCallback] Session found, redirecting to home")
          router.push("/")
        } else {
          console.log("[AuthCallback] No session, redirecting to login")
          router.push("/")
        }
      } catch (error) {
        clearTimeout(callbackTimeout)
        console.error("Error handling auth callback:", error)
        console.log("[AuthCallback] Error occurred, redirecting to home")
        router.push("/")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-white mt-4">Completing sign in...</p>
        <button 
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Continue to App
        </button>
      </div>
    </div>
  )
}
