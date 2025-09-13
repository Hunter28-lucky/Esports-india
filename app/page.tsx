"use client"

import { GameArenaDashboard } from "@/components/game-arena-dashboard"
import { MockAuthProvider } from "@/components/mock-auth-provider"

export default function Home() {
  console.log("[v0] Home page component loaded")

  return (
    <MockAuthProvider>
      <GameArenaDashboard />
    </MockAuthProvider>
  )
}
