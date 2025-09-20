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
  Gamepad2,
  Eye,
  ExternalLink,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
}

export default function MyTournaments({ user: userProp, onViewWaitingRoom }: MyTournamentsProps = {}) {
  const { toast } = useToast()
  const [tournaments, setTournaments] = useState<JoinedTournament[]>([])
  const [loading, setLoading] = useState(true)

  const mockTournaments: JoinedTournament[] = [
    {
      id: 'mock-1',
      name: 'PUBG Mobile Championship',
      game: 'PUBG Mobile',
      entry_fee: 50,
      prize_pool: 10000,
      max_players: 100,
      current_players: 45,
      status: 'upcoming',
      start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      room_id: 'PUBG123',
      room_password: 'password123',
      image_url: '/pubg-mobile-pro-tournament-esports.jpg',
      description: 'PUBG Mobile tournament with ₹10000 prize pool',
      joined_at: new Date().toISOString(),
      participants_count: 45
    },
    {
      id: 'mock-2',
      name: 'Free Fire World Championship',
      game: 'Free Fire',
      entry_fee: 30,
      prize_pool: 5000,
      max_players: 50,
      current_players: 32,
      status: 'upcoming',
      start_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      room_id: 'FF456',
      room_password: 'ff2024',
      image_url: '/free-fire-championship-tournament-esports.jpg',
      description: 'Free Fire tournament with ₹5000 prize pool',
      joined_at: new Date().toISOString(),
      participants_count: 32
    },
    {
      id: 'mock-3',
      name: 'Valorant Masters',
      game: 'Valorant',
      entry_fee: 100,
      prize_pool: 25000,
      max_players: 32,
      current_players: 28,
      status: 'live',
      start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Started 30 mins ago
      room_id: 'VAL789',
      room_password: 'valmasters',
      image_url: '/valorant-masters-tournament-esports.jpg',
      description: 'Valorant tournament with ₹25000 prize pool',
      joined_at: new Date().toISOString(),
      participants_count: 28
    }
  ]

  const fetchMyTournaments = async () => {
    console.log('🔍 Loading mock tournaments...')
    setLoading(true)
    
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('✅ Setting tournaments:', mockTournaments)
      setTournaments(mockTournaments)
      
      toast({
        title: "Tournaments Loaded",
        description: `Found ${mockTournaments.length} tournaments you've joined`,
        variant: "default",
      })
      
    } catch (error) {
      console.error('Error:', error)
      setTournaments([])
    } finally {
      console.log('🏁 Loading complete')
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('📥 Component mounted - fetching tournaments')
    fetchMyTournaments()
  }, []) // Remove user dependency to prevent re-renders

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

      <div className="max-w-6xl mx-auto p-4">
        {tournaments.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Tournaments Joined</h2>
            <p className="text-slate-400 mb-4">You haven't joined any tournaments yet.</p>
            <p className="text-slate-400 mb-6">Visit the Tournaments section to find exciting competitions to join!</p>
            
            <Button className="bg-primary hover:bg-primary/90">
              Browse Tournaments
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