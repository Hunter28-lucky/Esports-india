"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-white text-xl font-semibold">Sign in</h1>
        <button onClick={handleGoogle} className="px-4 py-2 bg-blue-600 rounded text-white">
          Continue with Google
        </button>
        <div>
          <button onClick={() => router.push("/")} className="text-slate-300 underline text-sm">
            Go back home
          </button>
        </div>
      </div>
    </div>
  )
}
