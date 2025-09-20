"use client"

import { GameArenaDashboard } from "@/components/game-arena-dashboard"
import { AuthProvider } from "@/components/auth-provider"

export default function Home() {
  return (
    <AuthProvider>
      <GameArenaDashboard />
    </AuthProvider>
  )
}