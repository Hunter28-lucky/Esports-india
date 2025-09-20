"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Users, 
  Clock, 
  DollarSign, 
  Eye,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

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
  const user = userProp || null

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
    
    try {
      if (!user?.id) {
        console.log('❌ No authenticated user found')
        setTournaments([])
        setLoading(false)
        return
      }

      console.log('👤 Fetching tournaments for user:', user.id)
      
      // Step 1: Get tournament participations
      console.log('🔍 Querying tournament_participants...')
      const { data: participants, error: participantsError } = await supabase
        .from('tournament_participants')
        .select('tournament_id, joined_at')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false })
        .limit(20)

      console.log('📊 Participants query result:', { 
        data: participants, 
        error: participantsError,
        count: participants?.length || 0 
      })

      if (participantsError) {
        console.error('❌ Participants query error:', participantsError)
        throw participantsError
      }

      if (!participants || participants.length === 0) {
        console.log('ℹ️ No tournament participations found')
        setTournaments([])
        setLoading(false)
        return
      }

      // Step 2: Get tournament details
      const tournamentIds = participants.map(p => p.tournament_id)
      console.log('🔍 Fetching tournament details for IDs:', tournamentIds)

      const { data: tournaments, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('*')
        .in('id', tournamentIds)

      console.log('🏆 Tournaments query result:', { 
        data: tournaments, 
        error: tournamentsError,
        count: tournaments?.length || 0 
      })

      if (tournamentsError) {
        console.error('❌ Tournaments query error:', tournamentsError)
        throw tournamentsError
      }

      if (!tournaments || tournaments.length === 0) {
        console.log('ℹ️ No tournament details found')
        setTournaments([])
        setLoading(false)
        return
      }

      // Step 3: Combine data
      const tournamentMap = new Map()
      tournaments.forEach(t => tournamentMap.set(t.id, t))

      const joinedTournaments = participants
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

    } catch (error) {
      console.error('❌ Error fetching tournaments:', error)
      setTournaments([])
      toast({
        title: "Error Loading Tournaments",
        description: "Failed to load your tournaments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('📥 Component mounted - fetching tournaments')
    fetchMyTournaments()
  }, [user?.id])

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Tournaments</h1>
          <p className="text-slate-400">View and manage your joined tournaments</p>
        </div>
        <Button 
          onClick={fetchMyTournaments}
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <h3 className="text-white font-bold text-lg text-center px-4">{tournament.game.toUpperCase()}</h3>
                  </div>
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