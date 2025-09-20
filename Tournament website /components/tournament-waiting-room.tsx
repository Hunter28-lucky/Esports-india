"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Users, Copy, CheckCircle, AlertCircle, Gamepad2, Shield, Zap, Clock, Trophy } from "lucide-react"
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
  user?: any
  onBack: () => void
  onLeaveTournament: () => void
}

export function TournamentWaitingRoom({ 
  tournamentName, 
  slotId, 
  joinedTournaments = [], 
  user,
  onBack, 
  onLeaveTournament 
}: WaitingRoomProps) {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [tournamentDetails, setTournamentDetails] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Select the first tournament if multiple are joined
  useEffect(() => {
    if (joinedTournaments.length > 0 && !selectedTournament) {
      setSelectedTournament(joinedTournaments[0])
    }
  }, [joinedTournaments, selectedTournament])

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
          setTournamentDetails(payload.new)
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const mockPlayers = [
    { name: "You (Alex Chen)", avatar: "/images/avatar-alexchen.png", status: "ready" },
    { name: "ProGamer_X", avatar: "/images/avatar-progamer.png", status: "ready" },
    { name: "SniperQueen", avatar: "/images/avatar-sniperqueen.png", status: "ready" },
    { name: "RushMaster", avatar: "/images/avatar-rushmaster.png", status: "waiting" },
    { name: "FireStorm99", avatar: null, status: "ready" },
    { name: "BattleKing", avatar: null, status: "waiting" },
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Tournament Waiting Room</h1>
              <p className="text-sm text-slate-400">{tournamentName}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLeaveTournament}
            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
          >
            Leave Tournament
          </Button>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        {/* Tournament Status */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Tournament Starting Soon</h2>
                  <p className="text-slate-400">Get ready for an epic battle!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-cyan-400">{formatTime(timeLeft)}</div>
                <p className="text-sm text-slate-400">Time remaining</p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-white">87/100</div>
                <p className="text-sm text-slate-400">Players Joined</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">₹4,500</div>
                <p className="text-sm text-slate-400">Prize Pool</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-400">₹50</div>
                <p className="text-sm text-slate-400">Entry Fee</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">Squad</div>
                <p className="text-sm text-slate-400">Game Mode</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Room Details */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <div className="p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Room Details</h3>
              {roomDetails.isReady && (
                <Badge className="bg-green-600 text-white border-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              )}
            </div>

            {!roomDetails.isReady ? (
              <div className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-400 animate-pulse" />
                <div>
                  <p className="text-white font-medium">Waiting for room details...</p>
                  <p className="text-slate-400 text-sm">
                    The admin will provide the room ID and password shortly. Please stay tuned!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <p className="text-slate-400 text-sm">Room ID</p>
                    <p className="text-white font-mono text-lg">{roomDetails.roomId}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(roomDetails.roomId!, "roomId")}
                    className="border-cyan-600 text-cyan-400 hover:bg-cyan-600 hover:text-white"
                  >
                    {copiedField === "roomId" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <p className="text-slate-400 text-sm">Password</p>
                    <p className="text-white font-mono text-lg">{roomDetails.password}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(roomDetails.password!, "password")}
                    className="border-cyan-600 text-cyan-400 hover:bg-cyan-600 hover:text-white"
                  >
                    {copiedField === "password" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="p-4 bg-green-900/20 border border-green-600 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-green-400" />
                    <p className="text-green-400 font-medium">Room is Ready!</p>
                  </div>
                  <p className="text-green-300 text-sm">
                    Join the game room using the details above. Make sure to join before the tournament starts!
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Players List */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Players in Your Squad</h3>
              <Badge className="bg-slate-700 text-slate-300 border-0">{mockPlayers.length}/4</Badge>
            </div>
            <div className="space-y-3">
              {mockPlayers.slice(0, 4).map((player, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                  <Avatar className="w-10 h-10">
                    {player.avatar ? (
                      <AvatarImage src={player.avatar || "/placeholder.svg"} />
                    ) : (
                      <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white font-medium">{player.name}</p>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          player.status === "ready" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      />
                      <p className="text-slate-400 text-sm capitalize">{player.status}</p>
                    </div>
                  </div>
                  {player.name.includes("You") && <Badge className="bg-cyan-600 text-white border-0">You</Badge>}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
