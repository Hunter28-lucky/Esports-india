import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://bdcwmkeluowefvcekwqq.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkY3dta2VsdW93ZWZ2Y2Vrd3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDA0MDQsImV4cCI6MjA3MTYxNjQwNH0.q5X6DKts-HTmF9gbZ3lJlIQwRnXqk_IpSeKfyrloQhE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  wallet_balance: number
  total_kills: number
  total_wins: number
  total_tournaments: number
  total_winnings: number
  created_at: string
  updated_at: string
}

export interface Tournament {
  id: string
  name: string
  game: string
  entry_fee: number
  prize_pool: number
  max_players: number
  current_players: number
  status: "upcoming" | "live" | "completed"
  start_time: string
  end_time?: string
  room_id?: string
  room_password?: string
  created_at: string
}

export interface TournamentParticipant {
  id: string
  tournament_id: string
  user_id: string
  joined_at: string
  placement?: number
  kills?: number
  prize_won: number
}

export interface Match {
  id: string
  tournament_id: string
  user_id: string
  game: string
  placement: number
  kills: number
  prize_won: number
  played_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: "deposit" | "withdrawal" | "tournament_entry" | "prize_win"
  amount: number
  description: string
  status: "pending" | "completed" | "failed"
  created_at: string
}
