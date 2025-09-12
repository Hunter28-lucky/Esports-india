"use client"

import { GameArenaDashboard } from "@/components/game-arena-dashboard"
import { MockAuthProvider } from "@/components/mock-auth-provider"

export default function Home() {
  return (
    <MockAuthProvider>
      <GameArenaDashboard />
    </MockAuthProvider>
  )
}
