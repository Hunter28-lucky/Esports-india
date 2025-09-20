"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, Clock, Trophy, ChevronLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Tournament {
  id: string
  name: string
  game: string
  status: string
  prize_pool: number
  start_time: string
  max_players: number
  current_players: number
  entry_fee: number
  description?: string
  image_url?: string
}

interface Player {
  id: string
  user_id: string
  tournament_id: string
  joined_at: string
  username: string
  avatar_url?: string
}

interface TournamentWaitingRoomProps {
  tournamentId?: string
  onBack: () => void
}

export function TournamentWaitingRoomSimple({ 
  tournamentId, 
  onBack 
}: TournamentWaitingRoomProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  
  // Debug states
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})
  
  useEffect(() => {
    console.log('TournamentWaitingRoomSimple - Initialize with tournamentId:', tournamentId)
    
    if (!tournamentId) {
      console.error('No tournament ID provided')
      setError('No tournament ID provided')
      setLoading(false)
      return
    }
    
    fetchTournamentData(tournamentId)
  }, [tournamentId])
  
  const fetchTournamentData = async (id: string) => {
    setLoading(true)
    setError(null)
    console.log('Fetching tournament data for ID:', id)
    
    try {
      // Fetch tournament details
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()
      
      if (tournamentError) {
        console.error('Error fetching tournament:', tournamentError)
        setError(`Tournament fetch error: ${tournamentError.message}`)
        setLoading(false)
        return
      }
      
      console.log('Tournament data fetched:', tournamentData)
      setTournament(tournamentData)
      setDebugInfo(prev => ({ ...prev, tournament: tournamentData }))
      
      // Fetch players in this tournament
      const { data: playersData, error: playersError } = await supabase
        .from('tournament_participants')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq('tournament_id', id)
      
      if (playersError) {
        console.error('Error fetching players:', playersError)
        setError(`Players fetch error: ${playersError.message}`)
        setLoading(false)
        return
      }
      
      console.log('Players data fetched:', playersData)
      
      // Format players data
      const formattedPlayers = playersData.map((player: any) => ({
        id: player.id,
        user_id: player.user_id,
        tournament_id: player.tournament_id,
        joined_at: player.created_at,
        username: player.profiles?.username || 'Unknown Player',
        avatar_url: player.profiles?.avatar_url
      }))
      
      setPlayers(formattedPlayers)
      setDebugInfo(prev => ({ ...prev, players: formattedPlayers }))
      
    } catch (error) {
      console.error('Unexpected error:', error)
      setError(`Unexpected error: ${String(error)}`)
    } finally {
      setLoading(false)
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }
  
  const refreshData = () => {
    if (tournamentId) {
      fetchTournamentData(tournamentId)
    }
  }
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-400">Loading tournament details...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-500 mb-4">⚠️ Error</div>
        <p className="text-red-400">{error}</p>
        <div className="mt-4">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button variant="outline" onClick={refreshData} className="ml-2">
            Try Again
          </Button>
        </div>
        
        <Card className="mt-8 p-4 bg-slate-900 border-red-900 w-full">
          <h3 className="text-red-400 mb-2">Debug Information</h3>
          <pre className="text-xs text-slate-400 whitespace-pre-wrap overflow-auto max-h-[300px]">
            Tournament ID: {tournamentId || 'Not provided'}{'\n'}
            Error: {error}{'\n'}
            Debug Info: {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </Card>
      </div>
    )
  }
  
  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-yellow-500 mb-4">⚠️ Warning</div>
        <p className="text-yellow-400">Tournament not found</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onBack} className="p-0 h-8 w-8">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white">Tournament Waiting Room</h1>
      </div>
      
      {/* Tournament Info */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">{tournament.name}</h2>
            <p className="text-slate-400 mb-4">{tournament.description || 'No description provided'}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-400">Game</p>
                <p className="font-medium text-white">{tournament.game}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Status</p>
                <p className="font-medium text-white capitalize">{tournament.status}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Start Time</p>
                <p className="font-medium text-white">{formatDate(tournament.start_time)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Entry Fee</p>
                <p className="font-medium text-white">₹{tournament.entry_fee}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-primary mr-2" />
                <span className="text-white">{tournament.current_players}/{tournament.max_players} Players</span>
              </div>
              <div className="flex items-center">
                <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-white">₹{tournament.prize_pool} Prize</span>
              </div>
            </div>
          </div>
          
          {tournament.image_url && (
            <div className="flex-shrink-0 w-full md:w-1/3">
              <img 
                src={tournament.image_url} 
                alt={tournament.name}
                className="w-full h-auto rounded-lg object-cover"
              />
            </div>
          )}
        </div>
      </Card>
      
      {/* Players */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Participants ({players.length}/{tournament.max_players})</h3>
          <Button variant="outline" onClick={refreshData} size="sm">
            Refresh
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {players.map((player) => (
            <Card key={player.id} className="bg-slate-900 border-slate-700 p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                {player.avatar_url ? (
                  <img 
                    src={player.avatar_url} 
                    alt={player.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    👤
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{player.username}</p>
                <p className="text-xs text-slate-400">Joined: {formatDate(player.joined_at)}</p>
              </div>
            </Card>
          ))}
          
          {players.length === 0 && (
            <div className="col-span-full text-center py-6 text-slate-400">
              No participants have joined this tournament yet.
            </div>
          )}
        </div>
      </Card>
      
      {/* Debug Card */}
      <Card className="bg-slate-900 border-slate-700 p-4">
        <h3 className="text-sm font-bold text-slate-400 mb-2">Debug Information</h3>
        <div className="text-xs text-slate-500">
          <p>Tournament ID: {tournamentId}</p>
          <p>Player Count: {players.length}</p>
          <p>Last Updated: {new Date().toLocaleTimeString()}</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-2 text-xs"
          onClick={() => {
            console.log('Tournament Waiting Room Debug:', {
              tournamentId,
              tournament,
              players,
              debugInfo
            })
            toast({
              title: "Debug Info",
              description: "Debug information logged to console",
            })
          }}
        >
          Log Debug Info
        </Button>
      </Card>
    </div>
  )
}