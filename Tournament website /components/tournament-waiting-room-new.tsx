"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Users, Copy, CheckCircle, AlertCircle, Gamepad2, Shield, Zap, Clock, Trophy, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Tournament {
  id: string
  name: string
  game: string
  entryFee: number
  joinedAt: Date
  status: "waiting" | "live" | "completed"
  roomId?: string
  password?: string
}

interface WaitingRoomProps {
  tournamentName?: string
  slotId?: string
  joinedTournaments?: Tournament[]
  selectedTournamentId?: string
  user?: any
  onBack: () => void
  onLeaveTournament: () => void
}

export function TournamentWaitingRoom({ 
  tournamentName, 
  slotId, 
  joinedTournaments = [], 
  selectedTournamentId,
  user,
  onBack, 
  onLeaveTournament 
}: WaitingRoomProps) {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [tournamentDetails, setTournamentDetails] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Select the tournament to display
  useEffect(() => {
    if (selectedTournamentId) {
      // If a specific tournament ID is provided, try to find it in joined tournaments
      const found = joinedTournaments.find(t => t.id === selectedTournamentId)
      if (found) {
        setSelectedTournament(found)
      } else {
        // If not found in joined tournaments, we'll fetch it from database
        // This happens when coming from "My Tournaments" page
        fetchSpecificTournament(selectedTournamentId)
      }
    } else if (joinedTournaments.length > 0 && !selectedTournament) {
      // Default behavior: select the first tournament
      setSelectedTournament(joinedTournaments[0])
    }
  }, [joinedTournaments, selectedTournament, selectedTournamentId])

  const fetchSpecificTournament = async (tournamentId: string) => {
    try {
      const { data: tournament, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single()

      if (error) throw error

      const tournamentData: Tournament = {
        id: tournament.id,
        name: tournament.name,
        game: tournament.game,
        entryFee: tournament.entry_fee,
        joinedAt: new Date(), // We don't have the exact join date in this context
        status: "waiting" as const,
        roomId: tournament.room_id,
        password: tournament.room_password
      }

      setSelectedTournament(tournamentData)
    } catch (error) {
      console.error('Error fetching specific tournament:', error)
    }
  }

  // Fetch tournament details and participants
  useEffect(() => {
    if (!selectedTournament) return

    const fetchTournamentData = async () => {
      setLoading(true)
      try {
        // Get tournament details
        const { data: tournament, error: tournamentError } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', selectedTournament.id)
          .single()

        if (tournamentError) throw tournamentError
        setTournamentDetails(tournament)

        // Get participants
        const { data: participantsData, error: participantsError } = await supabase
          .from('tournament_participants')
          .select(`
            id,
            joined_at,
            users (
              id,
              full_name,
              email,
              avatar_url
            )
          `)
          .eq('tournament_id', selectedTournament.id)
          .order('joined_at', { ascending: true })

        if (participantsError) throw participantsError
        setParticipants(participantsData || [])

      } catch (error) {
        console.error('Error fetching tournament data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTournamentData()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`tournament-${selectedTournament.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tournaments',
          filter: `id=eq.${selectedTournament.id}`
        }, 
        (payload) => {
          console.log('Tournament updated:', payload)
          if (payload.new) {
            setTournamentDetails(payload.new)
          }
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tournament_participants',
          filter: `tournament_id=eq.${selectedTournament.id}`
        }, 
        () => {
          // Refetch participants when someone joins/leaves
          fetchTournamentData()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [selectedTournament])

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatTimeUntilStart = (startTime: string) => {
    const start = new Date(startTime)
    const now = new Date()
    const diff = start.getTime() - now.getTime()

    if (diff <= 0) return "Starting now!"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (joinedTournaments.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-4xl mx-auto">
          <Button onClick={onBack} variant="ghost" className="mb-6 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tournaments
          </Button>
          
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Tournaments Joined</h2>
            <p className="text-slate-400">Join a tournament to see the waiting room</p>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedTournament || !tournamentDetails) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-4xl mx-auto">
          <Button onClick={onBack} variant="ghost" className="mb-6 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tournaments
          </Button>
          
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
            <p className="text-slate-400">Loading tournament details...</p>
          </div>
        </div>
      </div>
    )
  }

  const hasRoomDetails = tournamentDetails.room_id && tournamentDetails.room_password

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto p-4">
          <Button onClick={onBack} variant="ghost" className="mb-4 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tournaments
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{tournamentDetails.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary" className="bg-blue-600 text-white">
                  {tournamentDetails.game}
                </Badge>
                <span className="text-slate-400">Entry Fee: ₹{tournamentDetails.entry_fee}</span>
                <span className="text-slate-400">
                  Players: {participants.length}/{tournamentDetails.max_players}
                </span>
              </div>
            </div>
            
            {tournamentDetails.start_time && (
              <div className="text-center">
                <p className="text-slate-400 text-sm">Starting in</p>
                <div className="text-2xl font-bold text-cyan-400">
                  {formatTimeUntilStart(tournamentDetails.start_time)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Tournament Status */}
        <Card className="bg-slate-900 border-slate-700">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Tournament Status</h2>
            </div>
            
            {!hasRoomDetails ? (
              <div className="flex items-center gap-3 p-4 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-yellow-400 font-medium">Waiting for Admin</p>
                  <p className="text-slate-400 text-sm">
                    The tournament admin will provide room ID and password shortly. Stay tuned!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-green-600/20 border border-green-600/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-green-400 font-medium">Room Details Available!</p>
                  <p className="text-slate-400 text-sm">
                    Tournament room is ready. Check the details below to join.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Game Room Details */}
        {hasRoomDetails && (
          <Card className="bg-slate-900 border-slate-700">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Game Room Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-400 text-sm font-medium">Room ID</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(tournamentDetails.room_id, "roomId")}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedField === "roomId" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-white font-mono text-lg">{tournamentDetails.room_id}</p>
                </div>

                <div className="p-4 bg-slate-800 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-400 text-sm font-medium">Password</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(tournamentDetails.room_password, "password")}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedField === "password" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-white font-mono text-lg">{tournamentDetails.room_password}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg">
                <p className="text-blue-400 text-sm">
                  📱 <strong>Instructions:</strong> Copy the Room ID and Password, then join the game room. 
                  Wait for all players to join before starting the match.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Participants */}
        <Card className="bg-slate-900 border-slate-700">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Participants ({participants.length}/{tournamentDetails.max_players})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {participants.map((participant, index) => (
                <div key={participant.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={participant.users?.avatar_url} />
                    <AvatarFallback className="bg-slate-700 text-white">
                      {participant.users?.full_name?.charAt(0) || participant.users?.email?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {participant.users?.full_name || participant.users?.email?.split('@')[0] || "Player"}
                    </p>
                    <p className="text-slate-400 text-xs">
                      Joined {new Date(participant.joined_at).toLocaleTimeString()}
                    </p>
                  </div>
                  {index === 0 && (
                    <Badge variant="secondary" className="bg-yellow-600 text-white text-xs">
                      First
                    </Badge>
                  )}
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: tournamentDetails.max_players - participants.length }).map((_, index) => (
                <div key={`empty-${index}`} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-600">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-slate-500">Waiting for player...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button onClick={onLeaveTournament} variant="destructive" size="lg">
            Leave Tournament
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="lg"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </div>
      </div>
    </div>
  )
}