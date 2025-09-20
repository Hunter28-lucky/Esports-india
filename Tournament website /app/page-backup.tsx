"use client"

import { GameArenaDashboard } from "@/components/game-arena-dashboard"
import { AuthProvider } from "@/components/auth-provider"

export default function Home() {
  console.log("[v0] Home page component loaded")

  return (
    <AuthProvider>
      <GameArenaDashboard />
    </AuthProvider>
  )
}
