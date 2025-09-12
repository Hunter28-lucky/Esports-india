"use client"

import { GameArenaDashboard } from "@/components/game-arena-dashboard"
import { LoginScreen } from "@/components/login-screen"
import { useAuth } from "@/components/auth-provider"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return user ? <GameArenaDashboard /> : <LoginScreen />
}
