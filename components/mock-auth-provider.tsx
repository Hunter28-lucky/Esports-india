"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  wallet_balance: number
  total_kills: number
  total_wins: number
  total_tournaments: number
  total_winnings: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  updateWalletBalance: (newBalance: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<User>({
    id: "mock-user-id",
    email: "player@gamearena.com",
    full_name: "Gaming Pro",
    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
    wallet_balance: 2450,
    total_kills: 156,
    total_wins: 23,
    total_tournaments: 45,
    total_winnings: 12500,
  })

  const [walletBalance, setWalletBalance] = useState(user.wallet_balance)

  const updateWalletBalance = (newBalance: number) => {
    setWalletBalance(newBalance)
    if (user) {
      user.wallet_balance = newBalance
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: user ? { ...user, wallet_balance: walletBalance } : null,
        loading: false,
        updateWalletBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within a MockAuthProvider")
  }
  return context
}
