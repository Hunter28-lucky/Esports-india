"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const url = new URL(window.location.href)

        // 1) If implicit flow: tokens in URL hash
        if (url.hash) {
          const hashParams = new URLSearchParams(url.hash.substring(1))
          const access_token = hashParams.get("access_token") || undefined
          const refresh_token = hashParams.get("refresh_token") || undefined

          if (access_token && refresh_token) {
            console.log("[AuthCallback] Found tokens in hash, setting session")
            await supabase.auth.setSession({ access_token, refresh_token })
            // Clean the URL (remove hash) and redirect home
            router.replace("/")
            return
          }
        }

        // 2) If PKCE flow: code in query string
        const code = url.searchParams.get("code")
        if (code) {
          console.log("[AuthCallback] Found code param, exchanging for session")
          try {
            // @ts-ignore - runtime guard, works with supabase-js v2
            await supabase.auth.exchangeCodeForSession(code)
          } catch (e) {
            // Some versions accept the full URL
            // @ts-ignore
            if (typeof supabase.auth.exchangeCodeForSession === "function") {
              // @ts-ignore
              await supabase.auth.exchangeCodeForSession(window.location.href)
            } else {
              throw e
            }
          }
          router.replace("/")
          return
        }

        // 3) Fallback: ask client for current session
        console.log("[AuthCallback] No tokens/code found, checking session")
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          router.replace("/")
          return
        }

        // 4) Still nothing → send to login
        console.warn("[AuthCallback] No session after callback handling, redirecting to /login")
        router.replace("/login")
      } catch (error) {
        console.error("[AuthCallback] Error handling auth callback:", error)
        router.replace("/login")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-white mt-4">Completing sign in...</p>
      </div>
    </div>
  )
}
