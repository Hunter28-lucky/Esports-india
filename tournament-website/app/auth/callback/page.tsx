"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const router = useRouter()
  const ranRef = useRef(false)

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (ranRef.current) return
      ranRef.current = true
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
            // Confirm session, then redirect
            const { data } = await supabase.auth.getSession()
            if (data.session) {
              window.location.replace("/")
            } else {
              console.warn("[AuthCallback] Session not ready after setSession, retrying once...")
              setTimeout(async () => {
                const { data: retry } = await supabase.auth.getSession()
                if (retry.session) window.location.replace("/")
                else window.location.replace("/login")
              }, 250)
            }
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
          window.location.replace("/")
          return
        }

        // 3) Fallback: ask client for current session
        console.log("[AuthCallback] No tokens/code found, checking session")
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          window.location.replace("/")
          return
        }

        // 4) Still nothing → send to login
        console.warn("[AuthCallback] No session after callback handling, redirecting to /login")
        window.location.replace("/login")
      } catch (error) {
        console.error("[AuthCallback] Error handling auth callback:", error)
        window.location.replace("/login")
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
