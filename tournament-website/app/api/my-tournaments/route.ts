import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bdcwmkeluowefvcekwqq.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkY3dta2VsdW93ZWZ2Y2Vrd3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDA0MDQsImV4cCI6MjA3MTYxNjQwNH0.q5X6DKts-HTmF9gbZ3lJlIQwRnXqk_IpSeKfyrloQhE"
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)
  const timeout = (ms: number) => new Promise((resolve) => setTimeout(() => resolve({ __timeout: true }), ms))

  try {
    // Fetch participants
    const participantsQ = supabase
      .from('tournament_participants')
      .select('tournament_id, joined_at')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
      .limit(50)

    let result: any = await Promise.race([participantsQ, timeout(5000)])
    if (result?.__timeout) return NextResponse.json({ error: 'Timeout fetching participations' }, { status: 504 })
    const { data: participants, error: participantsError } = result
    if (participantsError) return NextResponse.json({ error: participantsError.message }, { status: 500 })
    if (!participants || participants.length === 0) return NextResponse.json({ tournaments: [] })

    // Fetch tournaments
    const ids = participants.map((p: any) => p.tournament_id)
    const tournamentsQ = supabase
      .from('tournaments')
      .select('id, name, game, entry_fee, prize_pool, max_players, current_players, status, start_time, room_id, room_password, image_url, created_at')
      .in('id', ids)

    result = await Promise.race([tournamentsQ, timeout(5000)])
    if (result?.__timeout) return NextResponse.json({ error: 'Timeout fetching tournaments' }, { status: 504 })
    const { data: tournaments, error: tournamentsError } = result
    if (tournamentsError) return NextResponse.json({ error: tournamentsError.message }, { status: 500 })

    const map = new Map<string, any>()
    tournaments?.forEach((t: any) => map.set(t.id, t))

    const joined = participants.map((p: any) => {
      const t = map.get(p.tournament_id)
      if (!t) return null
      return {
        ...t,
        joined_at: p.joined_at,
      }
    }).filter(Boolean)

    return NextResponse.json({ tournaments: joined })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
