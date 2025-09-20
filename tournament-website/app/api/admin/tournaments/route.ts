import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bdcwmkeluowefvcekwqq.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkY3dta2VsdW93ZWZ2Y2Vrd3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDA0MDQsImV4cCI6MjA3MTYxNjQwNH0.q5X6DKts-HTmF9gbZ3lJlIQwRnXqk_IpSeKfyrloQhE"
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)
  const timeout = (ms: number) => new Promise((resolve) => setTimeout(() => resolve({ __timeout: true }), ms))

  try {
    const q = supabase
      .from('tournaments')
      .select('id, name, game, entry_fee, prize_pool, max_players, current_players, status, start_time, image_url, room_id, room_password, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    const result: any = await Promise.race([q, timeout(6000)])
    if (result?.__timeout) {
      return NextResponse.json({ error: 'Timeout fetching tournaments' }, { status: 504 })
    }
    const { data, error } = result
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ tournaments: data || [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
