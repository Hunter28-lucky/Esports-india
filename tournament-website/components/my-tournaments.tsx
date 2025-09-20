"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Users, 
  Clock, 
  DollarSign, 
  Gamepad2,
  Eye,
  ExternalLink,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useState as useStateImport } from "react" // just for type reference

interface JoinedTournament {
  id: string
  name: string
  game: string
  entry_fee: number
  prize_pool: number
  max_players: number
  current_players: number
  status: string
  start_time: string
  room_id?: string
  room_password?: string
  image_url?: string
  description?: string
  joined_at: string
  participants_count: number
}

interface MyTournamentsProps {
  user?: any
  onViewWaitingRoom?: (tournamentId: string) => void
  onBrowseTournaments?: () => void
}

export default function MyTournaments({ user: userProp, onViewWaitingRoom, onBrowseTournaments }: MyTournamentsProps = {}) {
  const { toast } = useToast()
  const [tournaments, setTournaments] = useState<JoinedTournament[]>([])
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<{visible: boolean, steps: string[]}>({visible: false, steps: []})
  const [fetchFailCount, setFetchFailCount] = useState(0)
  // Use the user prop directly so updates from Auth propagate correctly
  const user = userProp || null

  // Fallback data disabled - always show real database state
  const fallbackTournaments: JoinedTournament[] = []

  // Helper to provide a sensible default image based on game
  const defaultImageForGame = (game?: string) => {
    const g = (game || "").toLowerCase()
    if (g.includes("pubg")) return "/pubg-mobile-pro-tournament-esports.jpg"
    if (g.includes("free fire")) return "/free-fire-championship-tournament-esports.jpg"
    if (g.includes("valorant")) return "/valorant-masters-tournament-esports.jpg"
    return "/placeholder.jpg"
  }

  const fetchMyTournaments = async () => {
    console.log('🔍 Fetching real tournaments you\'ve joined...')
    setLoading(true)
    setDebugInfo(prev => ({...prev, steps: ["Starting fetch"]}))
    
    // Add keyboard shortcut to show debug panel
    const toggleDebug = (e: KeyboardEvent) => {
      if (e.key === 'd' && e.altKey) {
        setDebugInfo(prev => ({...prev, visible: !prev.visible}))
      }
    }
    document.addEventListener('keydown', toggleDebug)
    
    // Remember to clean up after debugging
    setTimeout(() => document.removeEventListener('keydown', toggleDebug), 30000)
    
    try {
      if (!user?.id) {
        console.log('❌ No authenticated user found')
        console.log('🔍 User object:', user)
        console.log('🔍 Full user props:', userProp)
        setTournaments([])
        setLoading(false)
        toast({
          title: "Please Log In",
          description: "You need to be logged in to view your tournaments",
          variant: "default",
        })
        return
      }

      console.log('👤 Fetching tournaments for user:', user.id)
      setDebugInfo(prev => ({...prev, steps: [...prev.steps, `User authenticated: ${user.id.slice(0,8)}...`]}))
      
      // Try a much simpler approach first
      console.log('🔍 Attempting simple direct query...')
      
      try {
        // Simple direct query with timeout
        const { data: simpleParticipants, error: simpleError } = await supabase
          .from('tournament_participants')
          .select('tournament_id, joined_at')
          .eq('user_id', user.id)
          .limit(20)

        console.log('📊 Simple query result:', { 
          data: simpleParticipants, 
          error: simpleError,
          count: simpleParticipants?.length || 0 
        })

        if (simpleError) {
          console.error('❌ Database error:', simpleError)
          throw simpleError
        }

        if (!simpleParticipants || simpleParticipants.length === 0) {
          console.log('ℹ️ No tournament participations found for user')
          setTournaments([])
          setLoading(false)
          return
        }

        // Get tournament details for found participations
        const tournamentIds = simpleParticipants.map(p => p.tournament_id)
        console.log('🔍 Fetching tournament details for IDs:', tournamentIds)

        const { data: tournamentsData, error: tournamentsError } = await supabase
          .from('tournaments')
          .select('*')
          .in('id', tournamentIds)

        console.log('🏆 Tournaments query result:', { 
          data: tournamentsData, 
          error: tournamentsError,
          count: tournamentsData?.length || 0 
        })

        if (tournamentsError) {
          console.error('❌ Tournaments query error:', tournamentsError)
          throw tournamentsError
        }

        if (!tournamentsData || tournamentsData.length === 0) {
          console.log('ℹ️ No tournament details found')
          setTournaments([])
          setLoading(false)
          return
        }

        // Map the data to our component format
        const tournamentMap = new Map()
        tournamentsData.forEach(t => tournamentMap.set(t.id, t))

        const joinedTournaments = simpleParticipants
          .map(p => {
            const tournament = tournamentMap.get(p.tournament_id)
            if (!tournament) return null

            return {
              id: tournament.id,
              name: tournament.name,
              game: tournament.game,
              entry_fee: tournament.entry_fee,
              prize_pool: tournament.prize_pool,
              max_players: tournament.max_players,
              current_players: tournament.current_players || 0,
              status: tournament.status,
              start_time: tournament.start_time,
              room_id: tournament.room_id,
              room_password: tournament.room_password,
              image_url: defaultImageForGame(tournament.game),
              description: tournament.description || `${tournament.game} tournament with ₹${tournament.prize_pool} prize pool`,
              joined_at: p.joined_at,
              participants_count: tournament.current_players || 0,
            }
          })
          .filter(Boolean) as JoinedTournament[]

        console.log('✅ Final tournaments to display:', joinedTournaments)
        setTournaments(joinedTournaments)
        setLoading(false)
        
        // Reset fail counter on success
        setFetchFailCount(0)
        return

      } catch (directError) {
        console.error('❌ Direct query failed, trying fallback...', directError)
        
        // Fallback to the more complex timeout approach if needed
        const timeoutAfter = (ms: number) =>
          new Promise((resolve) => setTimeout(() => resolve({ __timeout: true }), ms))

        const participantsPromise = supabase
          .from('tournament_participants')
          .select('tournament_id, joined_at')
          .eq('user_id', user.id)
          .order('joined_at', { ascending: false })
          .limit(10)

        console.log('🔍 Starting fallback participants query with timeout...')
        const participantsResult = (await Promise.race([
          participantsPromise,
          timeoutAfter(10000), // Reduced timeout
        ])) as any

      if (participantsResult?.__timeout) {
        console.warn('⏳ Participants query timed out; showing empty state')
        setDebugInfo(prev => ({...prev, steps: [...prev.steps, "Query timeout after 15s"]}))
        
        // Increment fail counter
        setFetchFailCount(count => {
          const newCount = count + 1
          // After 3 consecutive failures, show helpful message
          if (newCount >= 3) {
            setDebugInfo(prev => ({...prev, steps: [...prev.steps, "⚠️ Multiple failures detected"]}))
          }
          return newCount
        })
        
        setTournaments([])
        
        // Schedule an auto-retry with backoff
        retryFetchWithBackoff(fetchFailCount);
        
        setLoading(false)
        toast({
          title: 'Connection Slow',
          description: 'Fetching your tournaments is taking too long. Try again in a moment.',
          variant: 'default',
        })
        // Fire a background retry that will silently update if it succeeds later
        ;(async () => {
          try {
            const { data: bgParticipants, error: bgPError } = await participantsPromise
            if (bgPError || !bgParticipants?.length) return
            const tournamentIds = bgParticipants.map((r: any) => r.tournament_id)
            const { data: bgTournaments, error: bgTError } = await supabase
              .from('tournaments')
              .select('id, name, game, entry_fee, prize_pool, max_players, current_players, status, start_time, room_id, room_password')
              .in('id', tournamentIds)
            if (bgTError || !bgTournaments) return
            const tMap = new Map<string, any>()
            bgTournaments.forEach((t: any) => tMap.set(t.id, t))
            const merged = bgParticipants
              .map((p: any) => {
                const t = tMap.get(p.tournament_id)
                if (!t) return null
                return {
                  id: t.id,
                  name: t.name,
                  game: t.game,
                  entry_fee: t.entry_fee,
                  prize_pool: t.prize_pool,
                  max_players: t.max_players,
                  current_players: t.current_players || 0,
                  status: t.status,
                  start_time: t.start_time,
                  room_id: t.room_id,
                  room_password: t.room_password,
                  image_url: defaultImageForGame(t.game),
                  description: `${t.game} tournament with ₹${t.prize_pool} prize pool`,
                  joined_at: p.joined_at,
                  participants_count: t.current_players || 0,
                }
              })
              .filter(Boolean) as JoinedTournament[]
            if (merged.length) {
              setTournaments(merged)
            }
          } catch {}
        })()
        return
      }

  const { data: participantRows, error: participantsError } = participantsResult
      
  console.log('📊 Participants query result:', { data: participantRows, error: participantsError })
      setDebugInfo(prev => ({...prev, steps: [...prev.steps, 
        `Participants query: ${participantRows ? participantRows.length : 0} results, ` + 
        `${participantsError ? 'Error: ' + participantsError.message : 'No error'}`]}))

      if (participantsError) {
        console.error('❌ Error fetching joined tournaments:', participantsError)
        toast({
          title: "Database Error",
          description: `Failed to fetch your tournaments: ${participantsError.message || JSON.stringify(participantsError)}`,
          variant: "destructive",
        })
        setTournaments([])
        setLoading(false)
        return
      }

      if (!participantRows || participantRows.length === 0) {
        console.log('ℹ️ No tournaments joined yet')
        setDebugInfo(prev => ({...prev, steps: [...prev.steps, "No tournaments joined yet"]}))
        setTournaments([])
        setLoading(false)
        toast({
          title: "No Tournaments Joined",
          description: "You haven't joined any tournaments yet. Browse available tournaments to get started!",
          variant: "default",
        })
        return
      }
      
      setDebugInfo(prev => ({...prev, steps: [...prev.steps, `Found ${participantRows.length} tournament participations`]}))

      // Step 2: Fetch tournament details for those IDs
      const tournamentIds = participantRows.map((r: any) => r.tournament_id)
      setDebugInfo(prev => ({...prev, steps: [...prev.steps, `Fetching details for ${tournamentIds.length} tournaments`]}))
      // Optimize query to reduce overhead
      const tournamentsPromise = supabase
        .from('tournaments')
        .select('id, name, game, entry_fee, prize_pool, max_players, current_players, status, start_time, room_id, room_password')
        .in('id', tournamentIds)
        .order('start_time', { ascending: false })

      const tournamentsResult = (await Promise.race([
        tournamentsPromise,
        timeoutAfter(15000), // Increased from 8000ms to 15000ms
      ])) as any

      if (tournamentsResult?.__timeout) {
        console.warn('⏳ Tournaments query timed out; showing minimal info')
        setDebugInfo(prev => ({...prev, steps: [...prev.steps, "Tournament details query timed out after 15s"]}))
        setTournaments([])
        setLoading(false)
        toast({
          title: 'Connection Slow',
          description: 'Tournament details took too long to load. Please try refreshing.',
          variant: 'default',
        })
        return
      }

      const { data: tournamentsData, error: tournamentsError } = tournamentsResult
      setDebugInfo(prev => ({...prev, steps: [...prev.steps, 
        `Tournament details: ${tournamentsData ? tournamentsData.length : 0} tournaments found, ` + 
        `${tournamentsError ? 'Error: ' + tournamentsError.message : 'No error'}`]}))
        
      if (tournamentsError) {
        console.error('❌ Error fetching tournaments by IDs:', tournamentsError)
        setTournaments([])
        setLoading(false)
        toast({
          title: 'Database Error',
          description: `Failed to load tournaments: ${tournamentsError.message || JSON.stringify(tournamentsError)}`,
          variant: 'destructive',
        })
        return
      }

      // Build map for quick lookup
      const tournamentMap = new Map<string, any>()
      ;(tournamentsData || []).forEach((t: any) => tournamentMap.set(t.id, t))

      // Compose final list
      const formattedTournaments: JoinedTournament[] = participantRows
        .map((p: any) => {
          const t = tournamentMap.get(p.tournament_id)
          if (!t) return null
          return {
            id: t.id,
            name: t.name,
            game: t.game,
            entry_fee: t.entry_fee,
            prize_pool: t.prize_pool,
            max_players: t.max_players,
            current_players: t.current_players || 0,
            status: t.status,
            start_time: t.start_time,
            room_id: t.room_id,
            room_password: t.room_password,
            image_url: defaultImageForGame(t.game),
            description: `${t.game} tournament with ₹${t.prize_pool} prize pool`,
            joined_at: p.joined_at,
            participants_count: t.current_players || 0,
          }
        })
        .filter(Boolean) as JoinedTournament[]

      console.log('✅ Successfully formatted joined tournaments:', formattedTournaments)
      setDebugInfo(prev => ({...prev, steps: [...prev.steps, 
        `Successfully formatted ${formattedTournaments.length} tournaments`]}))
      setTournaments(formattedTournaments)
      
      toast({
        title: "Tournaments Loaded",
        description: `Found ${formattedTournaments.length} tournament${formattedTournaments.length === 1 ? '' : 's'} you've joined`,
        variant: "default",
      })
      
    } catch (error) {
      console.error('💥 Error loading tournaments:', error)
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          toast({
            title: "Connection Timeout",
            description: "Database connection timed out. Please check your internet connection and try again.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Database Error", 
            description: `Failed to load tournaments: ${error.message}`,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Unknown Error",
          description: "An unexpected error occurred while loading tournaments",
          variant: "destructive",
        })
      }
      
      setTournaments([])
    } finally {
      console.log('🏁 Loading complete')
      setDebugInfo(prev => ({...prev, steps: [...prev.steps, "Loading complete"]}))
      setLoading(false)
    }
  }

  // Retry with exponential backoff
  const retryFetchWithBackoff = useCallback((attempt = 0, maxAttempts = 3) => {
    if (attempt >= maxAttempts) return;
    
    const backoffTime = Math.min(2000 * Math.pow(2, attempt), 10000); // 2s, 4s, 8s, max 10s
    
    setTimeout(() => {
      console.log(`🔄 Retry attempt ${attempt + 1} of ${maxAttempts}...`);
      setDebugInfo(prev => ({...prev, steps: [...prev.steps, 
        `Auto-retry attempt ${attempt + 1} of ${maxAttempts}`]}));
      fetchMyTournaments();
    }, backoffTime);
  }, []);
  
  useEffect(() => {
    console.log('📥 Component mounted - fetching real tournaments for user:', user)
    setDebugInfo(prev => ({...prev, steps: [...prev.steps, 
      `Component mounted - user: ${user ? 'authenticated' : 'not authenticated'}`]}))
    
    if (user?.id) {
      fetchMyTournaments()
    } else {
      // If no user yet, set a small delay and try again as auth might be resolving
      setTimeout(() => {
        if (userProp?.id) {
          console.log('🔄 Delayed fetch after auth resolved')
          setDebugInfo(prev => ({...prev, steps: [...prev.steps, 'Delayed fetch after auth resolved']}))
          fetchMyTournaments()
        }
      }, 1500)
    }
  }, [user?.id]) // Watch for user ID changes

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-slate-400 mt-2">Loading tournaments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
                My Tournaments
              </h1>
              <p className="text-muted-foreground mt-1">
                View all tournaments you've joined and their current status
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setDebugInfo(prev => ({...prev, visible: !prev.visible}))
                }}
                size="sm" 
                variant="outline"
                className="hidden sm:flex items-center gap-2"
              >
                Debug
              </Button>
              <Button 
                onClick={fetchMyTournaments}
                size="sm" 
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug panel - toggle with Alt+D or the debug button */}
      {debugInfo.visible && (
        <div className="max-w-6xl mx-auto p-4 bg-gray-900/70 border border-primary/30 rounded-md my-2">
          <h3 className="text-lg font-semibold text-primary mb-2">Debug Info</h3>
          <div className="text-xs font-mono bg-black/50 p-2 rounded max-h-40 overflow-y-auto">
            {debugInfo.steps.map((step, i) => (
              <div key={i} className="mb-1">
                <span className="text-slate-400">[{i+1}]</span> <span className="text-white">{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button 
              onClick={fetchMyTournaments} 
              variant="outline" 
              size="sm"
              className="text-xs"
            >
              Force Refresh
            </Button>
            <Button 
              onClick={() => setDebugInfo({visible: false, steps: []})} 
              variant="destructive" 
              size="sm"
              className="text-xs"
            >
              Clear Debug
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4">
        {tournaments.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              {!user ? "Please Log In" : "No Tournaments Joined"}
            </h2>
            <p className="text-slate-400 mb-4">
              {!user 
                ? "You need to log in to view and join tournaments." 
                : "You haven't joined any tournaments yet."
              }
            </p>
            {user && (
              <div className="bg-slate-800/50 p-4 rounded-lg mb-4 text-left max-w-md mx-auto">
                <p className="text-xs text-slate-500 mb-2">Debug Info:</p>
                <p className="text-xs text-slate-400">User ID: {user.id}</p>
                <p className="text-xs text-slate-400">Email: {user.email}</p>
                <p className="text-xs text-slate-400">Query executed: {loading ? 'Loading...' : 'Completed'}</p>
                <p className="text-xs text-slate-400">Tournaments found: {tournaments.length}</p>
              </div>
            )}
            <p className="text-slate-400 mb-6">
              {!user 
                ? "Log in to your account to start participating in exciting esports competitions!"
                : "Visit the Tournaments section to find exciting competitions to join!"
              }
            </p>
            
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                if (!user) return
                onBrowseTournaments?.()
              }}
            >
              {!user ? "Log In" : "Browse Tournaments"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Badge className={`absolute top-4 right-4 ${
                    tournament.status === 'live' ? 'bg-red-600' : 
                    tournament.status === 'upcoming' ? 'bg-green-600' : 'bg-gray-600'
                  } text-white`}>
                    {tournament.status === 'live' ? '🔴 LIVE' : tournament.status.toUpperCase()}
                  </Badge>
                  <Gamepad2 className="w-12 h-12 text-white" />
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{tournament.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {tournament.game}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-xs text-slate-400">Entry Fee</p>
                        <p className="text-sm font-bold text-white">₹{tournament.entry_fee}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <div>
                        <p className="text-xs text-slate-400">Prize Pool</p>
                        <p className="text-sm font-bold text-white">₹{tournament.prize_pool}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-slate-400">Players</p>
                        <p className="text-sm font-bold text-white">{tournament.current_players}/{tournament.max_players}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <div>
                        <p className="text-xs text-slate-400">
                          {tournament.status === 'live' ? 'Started' : 'Starts in'}
                        </p>
                        <p className="text-sm font-bold text-white">
                          {tournament.status === 'live' ? 'Live Now' :
                            new Date(tournament.start_time) > new Date() ? 
                            `${Math.ceil((new Date(tournament.start_time).getTime() - new Date().getTime()) / (1000 * 60))}m` :
                            'Started'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {tournament.room_id && (
                    <div className="bg-slate-700/50 p-3 rounded-lg mb-4">
                      <p className="text-xs text-slate-400 mb-1">Room Details:</p>
                      <p className="text-sm text-white">Room ID: <span className="font-mono bg-slate-600 px-2 py-1 rounded">{tournament.room_id}</span></p>
                      <p className="text-sm text-white mt-1">Password: <span className="font-mono bg-slate-600 px-2 py-1 rounded">{tournament.room_password}</span></p>
                    </div>
                  )}

                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{tournament.description}</p>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {tournament.room_id && (
                      <Button 
                        size="sm" 
                        className={`flex-1 ${
                          tournament.status === 'live' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        onClick={() => onViewWaitingRoom?.(tournament.id)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {tournament.status === 'live' ? 'Join Match' : 'Waiting Room'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}