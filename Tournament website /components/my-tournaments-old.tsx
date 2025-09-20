"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Trophy, 
  Users, 
  Clock, 
  DollarSign, 
  Calendar,
  Gamepad2,
  Eye,
  ExternalLink,
  RefreshCw,
  MapPin,
  Timer
} from "lucide-react"
import { supabase } from "@/lib/supabase"
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
  const [user] = useState(userProp || { id: 'test-user-123' })
  const [selectedTournament, setSelectedTournament] = useState<JoinedTournament | null>(null)

  console.log('🧑‍💼 MyTournaments component initialized with user:', user)

  // Debug utility function for testing database connection
  const testDatabaseConnection = async () => {
    console.log('🔧 Testing database connection...')
    try {
      const result = await supabase.from('tournament_participants').select('count').limit(1)
      console.log('✅ Database test result:', result)
      toast({
        title: "Database Test",
        description: result.error ? `Error: ${result.error.message}` : "Connection successful!",
        variant: result.error ? "destructive" : "default",
      })
      return result
    } catch (error) {
      console.error('❌ Database test failed:', error)
      toast({
        title: "Database Test Failed",
        description: `Error: ${error}`,
        variant: "destructive",
      })
      return { error }
    }
  }

  // Make test function available globally for debugging
  useEffect(() => {
    (window as any).testDatabaseConnection = testDatabaseConnection
    console.log('🔧 Debug utility available: window.testDatabaseConnection()')
  }, [])

  // Debug tournaments state changes
  useEffect(() => {
    console.log('🎯 Tournaments state changed:', tournaments.length, 'tournaments')
    console.log('📊 Current tournaments:', tournaments)
  }, [tournaments])

  const fetchMyTournaments = async () => {
    console.log('🔍 fetchMyTournaments called with user:', user)
    console.log('🔍 User ID:', user?.id)
    
    if (!user || !user.id) {
      console.log('❌ No user or user ID found')
      setTournaments([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      console.log('🔍 Fetching real tournaments for user:', user.id)
      
      // Query to get tournament participants with full tournament details
      const { data: participantData, error: participantError } = await supabase
        .from('tournament_participants')
        .select(`
          tournament_id,
          joined_at,
          tournaments (
            id,
            name,
            game,
            entry_fee,
            prize_pool,
            max_players,
            status,
            start_time,
            room_id,
            room_password,
            image_url,
            description
          )
        `)
        .eq('user_id', user.id)

      console.log('� Real participant result:', { data: participantData, error: participantError })

      if (participantResult.error) {
        console.error('❌ Error fetching participants:', participantResult.error)
        toast({
          title: "Query Error",
          description: `Database error: ${participantResult.error.message}`,
          variant: "destructive",
        })
        setTournaments([])
        setLoading(false)
        return
      }

      const participantData = participantResult.data || []
      console.log('🗂️ Processed participant data:', participantData)
      console.log('📊 Participant data length:', participantData.length)

      if (!participantData || participantData.length === 0) {
        console.log('ℹ️ No tournaments found for this user - providing demo tournaments')
        
        // Provide demo tournaments for better user experience
        const demoTournaments: JoinedTournament[] = [
          {
            id: 'demo-1',
            name: 'Free Fire Championship (Demo)',
            game: 'Free Fire',
            entry_fee: 100,
            prize_pool: 1000,
            max_players: 50,
            current_players: 25,
            status: 'active',
            start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            room_id: 'FF123',
            room_password: 'DEMO123',
            image_url: undefined,
            description: 'Demo tournament - Join a real tournament to see actual data',
            joined_at: new Date().toISOString(),
            participants_count: 25
          },
          {
            id: 'demo-2',
            name: 'PUBG Mobile Pro Tournament (Demo)',
            game: 'PUBG Mobile',
            entry_fee: 50,
            prize_pool: 500,
            max_players: 30,
            current_players: 18,
            status: 'active',
            start_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            room_id: undefined,
            room_password: undefined,
            image_url: undefined,
            description: 'Demo tournament - Experience the tournament interface',
            joined_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            participants_count: 18
          }
        ]
        
        setTournaments(demoTournaments)
        setLoading(false)
        toast({
          title: "Demo Mode",
          description: "Showing demo tournaments. Join real tournaments to see your actual data!",
          variant: "default",
        })
        return
      }

      console.log('🏗️ Creating mock tournaments for participant data...', participantData)

      // Create mock data for now since we know the user has joined tournaments
      const mockTournaments: JoinedTournament[] = participantData.map((participant: any, index: number) => ({
        id: participant.tournament_id || `mock-${index}`,
        name: `Tournament ${index + 1}`,
        game: 'Free Fire',
        entry_fee: 100,
        prize_pool: 1000,
        max_players: 50,
        current_players: 25,
        status: 'active',
        start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        room_id: undefined,
        room_password: undefined,
        image_url: undefined,
        description: 'Tournament description',
        joined_at: participant.joined_at || new Date().toISOString(),
        participants_count: 25
      }))

      console.log('✅ Setting mock tournaments:', mockTournaments)
      setTournaments(mockTournaments)
      console.log('🎯 Tournaments state should now be:', mockTournaments.length, 'items')

    } catch (error) {
      console.error('💥 Database query failed:', error)
      toast({
        title: "Database Error",
        description: "Failed to connect to database. Please try again later.",
        variant: "destructive",
      })
      setTournaments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('📥 MyTournaments useEffect triggered - calling fetchMyTournaments')
    fetchMyTournaments()
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600'
      case 'upcoming': return 'bg-blue-600'
      case 'live': return 'bg-red-600'
      case 'completed': return 'bg-gray-600'
      default: return 'bg-yellow-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />
      case 'upcoming': return <Calendar className="w-4 h-4" />
      case 'live': return <Trophy className="w-4 h-4" />
      case 'completed': return <Trophy className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatTimeUntilStart = (startTime: string) => {
    const start = new Date(startTime)
    const now = new Date()
    const diff = start.getTime() - now.getTime()

    if (diff <= 0) return "Started"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
            <p className="text-slate-400">Loading your tournaments...</p>
            <p className="text-slate-500 text-sm mt-2">
              User ID: {user?.id || 'Not available'}
            </p>
            <Button 
              onClick={() => {
                setLoading(false)
                setTournaments([])
              }}
              variant="outline"
              size="sm"
              className="mt-4 border-slate-600 text-slate-300"
            >
              Skip Loading
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                My Tournaments
              </h1>
              <p className="text-slate-400 mt-1">
                View all tournaments you've joined and their current status
              </p>
            </div>
            <Button 
              onClick={fetchMyTournaments}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
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
            <p className="text-slate-400 mb-4">Join some tournaments to see them here!</p>
            
            {/* Debug info */}
            <div className="mt-8 p-4 bg-slate-800 rounded-lg text-left max-w-md mx-auto">
              <h3 className="text-white font-semibold mb-2">Debug Info:</h3>
              <div className="space-y-1 text-sm text-slate-400">
                <p>User ID: {user?.id || 'Not available'}</p>
                <p>User Email: {(user as any)?.email || 'Not available'}</p>
                <p>Loading State: {loading ? 'Loading' : 'Loaded'}</p>
                <p>Tournaments Count: {tournaments.length}</p>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={fetchMyTournaments}
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Retry Loading
                </Button>
                <Button
                  onClick={() => {
                    // Create demo tournaments for testing
                    const demoTournaments: JoinedTournament[] = [
                      {
                        id: 'demo-1',
                        name: 'Free Fire Championship Demo',
                        game: 'Free Fire',
                        entry_fee: 150,
                        prize_pool: 5000,
                        max_players: 100,
                        current_players: 85,
                        status: 'active',
                        start_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
                        room_id: 'FF2024DEMO',
                        room_password: 'DEMO123',
                        image_url: '/placeholder.jpg',
                        description: 'Demo tournament for testing purposes',
                        joined_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                        participants_count: 85
                      },
                      {
                        id: 'demo-2',
                        name: 'PUBG Mobile Pro Demo',
                        game: 'PUBG Mobile',
                        entry_fee: 200,
                        prize_pool: 10000,
                        max_players: 64,
                        current_players: 64,
                        status: 'live',
                        start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                        room_id: 'PUBG2024',
                        room_password: 'LIVE456',
                        image_url: '/placeholder.jpg',
                        description: 'Live demo tournament',
                        joined_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        participants_count: 64
                      }
                    ]
                    setTournaments(demoTournaments)
                    toast({
                      title: "Demo Mode",
                      description: "Loaded demo tournaments for testing",
                      variant: "default",
                    })
                  }}
                  size="sm"
                  variant="outline"
                  className="flex-1 border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                >
                  Demo Mode
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="bg-slate-900 border-slate-700 overflow-hidden">
                <div className="relative">
                  {/* Tournament Image */}
                  {tournament.image_url ? (
                    <img
                      src={tournament.image_url}
                      alt={tournament.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.jpg"
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <Gamepad2 className="w-16 h-16 text-white" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <Badge 
                    className={`absolute top-4 right-4 ${getStatusColor(tournament.status)} text-white`}
                  >
                    {getStatusIcon(tournament.status)}
                    <span className="ml-1 capitalize">{tournament.status}</span>
                  </Badge>
                </div>

                <div className="p-6">
                  {/* Tournament Name & Game */}
                  <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="bg-blue-600 text-white">
                      {tournament.game}
                    </Badge>
                    <span className="text-slate-400 text-sm">
                      Joined {new Date(tournament.joined_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Tournament Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-slate-400 text-xs">Entry Fee</p>
                        <p className="text-white font-semibold">₹{tournament.entry_fee}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <div>
                        <p className="text-slate-400 text-xs">Prize Pool</p>
                        <p className="text-white font-semibold">₹{tournament.prize_pool}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-slate-400 text-xs">Players</p>
                        <p className="text-white font-semibold">
                          {tournament.participants_count}/{tournament.max_players}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-slate-400 text-xs">
                          {tournament.status === 'completed' ? 'Finished' : 'Starts in'}
                        </p>
                        <p className="text-white font-semibold">
                          {tournament.status === 'completed' 
                            ? new Date(tournament.start_time).toLocaleDateString()
                            : formatTimeUntilStart(tournament.start_time)
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Room Details (if available) */}
                  {tournament.room_id && (
                    <div className="p-3 bg-green-600/20 border border-green-600/30 rounded-lg mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-medium">Room Details Available</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-400">Room ID:</span>
                          <span className="text-white font-mono ml-2">{tournament.room_id}</span>
                        </div>
                        {tournament.room_password && (
                          <div>
                            <span className="text-slate-400">Password:</span>
                            <span className="text-white font-mono ml-2">{tournament.room_password}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description (if available) */}
                  {tournament.description && (
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {tournament.description}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedTournament(tournament)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    
                    {(tournament.status === 'active' || tournament.status === 'live') && (
                      <Button
                        onClick={() => onViewWaitingRoom?.(tournament.id)}
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Waiting Room
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Tournament Details Modal */}
      {selectedTournament && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-900 border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Tournament Details</h2>
                <Button
                  onClick={() => setSelectedTournament(null)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>

              {/* Tournament Image */}
              {selectedTournament.image_url ? (
                <img
                  src={selectedTournament.image_url}
                  alt={selectedTournament.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.jpg"
                  }}
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center rounded-lg mb-4">
                  <Gamepad2 className="w-20 h-20 text-white" />
                </div>
              )}

              <h3 className="text-2xl font-bold text-white mb-2">{selectedTournament.name}</h3>
              
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-blue-600 text-white">
                  {selectedTournament.game}
                </Badge>
                <Badge className={`${getStatusColor(selectedTournament.status)} text-white`}>
                  {getStatusIcon(selectedTournament.status)}
                  <span className="ml-1 capitalize">{selectedTournament.status}</span>
                </Badge>
              </div>

              {selectedTournament.description && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Description</h4>
                  <p className="text-slate-400">{selectedTournament.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Tournament Info</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Entry Fee:</span>
                      <span className="text-white">₹{selectedTournament.entry_fee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Prize Pool:</span>
                      <span className="text-white">₹{selectedTournament.prize_pool}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Max Players:</span>
                      <span className="text-white">{selectedTournament.max_players}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Players:</span>
                      <span className="text-white">{selectedTournament.participants_count}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Your Info</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Joined:</span>
                      <span className="text-white">
                        {new Date(selectedTournament.joined_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Start Time:</span>
                      <span className="text-white">
                        {new Date(selectedTournament.start_time).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Time Until Start:</span>
                      <span className="text-white">
                        {formatTimeUntilStart(selectedTournament.start_time)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedTournament.room_id && (
                <div className="p-4 bg-green-600/20 border border-green-600/30 rounded-lg mb-4">
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Game Room Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400">Room ID:</span>
                      <p className="text-white font-mono text-lg">{selectedTournament.room_id}</p>
                    </div>
                    {selectedTournament.room_password && (
                      <div>
                        <span className="text-slate-400">Password:</span>
                        <p className="text-white font-mono text-lg">{selectedTournament.room_password}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={() => setSelectedTournament(null)}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Close
                </Button>
                {(selectedTournament.status === 'active' || selectedTournament.status === 'live') && (
                  <Button
                    onClick={() => {
                      setSelectedTournament(null)
                      onViewWaitingRoom?.(selectedTournament.id)
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Go to Waiting Room
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}