import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use the same project as the client. Prefer env if present, else fall back to constants.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bdcwmkeluowefvcekwqq.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkY3dta2VsdW93ZWZ2Y2Vrd3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDA0MDQsImV4cCI6MjA3MTYxNjQwNH0.q5X6DKts-HTmF9gbZ3lJlIQwRnXqk_IpSeKfyrloQhE"

// Optionally use service role if provided on Vercel to bypass RLS for diagnostics (DO NOT expose to client)
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET() {
  const supabaseServer = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)

  // Timeout helper
  const timeout = (ms: number) => new Promise((resolve) => setTimeout(() => resolve({ __timeout: true }), ms))

  try {
    // First try a wide select, then fallback to minimal
    const wideQuery = supabaseServer
      .from('tournaments')
      .select('id, name, game, entry_fee, prize_pool, max_players, current_players, status, start_time, image_url')
      .order('start_time', { ascending: false })

    let result: any = await Promise.race([wideQuery, timeout(5000)]) // 5s server timeout
    if (result?.__timeout) {
      return NextResponse.json({ error: 'Timeout fetching tournaments' }, { status: 504 })
    }

    let { data, error } = result
    if (error) {
      // Retry with minimal columns
      const minimalQuery = supabaseServer
        .from('tournaments')
        .select('id, name, game, entry_fee, prize_pool, max_players, current_players, status, start_time')
        .order('start_time', { ascending: false })
      result = await Promise.race([minimalQuery, timeout(4000)])
      if (result?.__timeout) {
        return NextResponse.json({ error: 'Timeout fetching tournaments (retry)' }, { status: 504 })
      }
      data = result.data
      error = result.error
    }

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to fetch tournaments' }, { status: 500 })
    }

    return NextResponse.json({ tournaments: data || [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}
