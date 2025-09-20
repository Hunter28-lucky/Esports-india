"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Target, Zap, Plus, ImageOff } from "lucide-react"
import { TournamentJoinTest } from "./tournament-join-test"

interface TournamentsSectionProps {
  onJoinTournament: (tournamentId: string, tournamentName: string, entryFee: number) => void
  onCreateTournament: () => void
  isAdmin: boolean
  tournaments?: any[]
}

export function TournamentsSection({ onJoinTournament, onCreateTournament, isAdmin, tournaments: externalTournaments }: TournamentsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  // No static fallback; only real tournaments

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-600"
      case "open":
        return "bg-green-600"
      case "soon":
        return "bg-yellow-600"
      default:
        return "bg-gray-600"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "live":
        return "LIVE"
      case "open":
        return "OPEN"
      case "soon":
        return "SOON"
      default:
        return "CLOSED"
    }
  }

  // Normalize external tournaments (Supabase) to component shape if provided
  const normalizedExternal = (externalTournaments || []).map(t => {
    // derive status pill color via status, calculate players display
    const playersDisplay = `${t.current_players ?? 0}/${t.max_players}`
    // derive relative time (simple, not exact countdown)
    let startLabel = 'Soon'
    try {
      const start = new Date(t.start_time)
      const diffMs = start.getTime() - Date.now()
      if (diffMs > 0) {
        const diffMins = Math.round(diffMs / 60000)
        if (diffMins < 60) startLabel = diffMins + 'm'
        else {
          const h = Math.floor(diffMins / 60)
          const m = diffMins % 60
            startLabel = `${h}h ${m}m`
        }
      } else {
        startLabel = 'LIVE'
      }
    } catch {}
    return {
      id: t.id,
      name: t.name,
      game: t.game,
  image: t.image_url || '/placeholder.jpg',
  icon: t.game?.toLowerCase().includes('pubg') ? <Target className="w-4 h-4 text-blue-500" /> : <Zap className="w-4 h-4 text-orange-500" />,
      status: t.status === 'upcoming' ? 'open' : t.status === 'live' ? 'live' : 'soon',
      entryFee: t.entry_fee,
      prizePool: t.prize_pool,
      players: playersDisplay,
      startTime: startLabel,
      gameMode: t.game,
    }
  })

  const sourceTournaments = normalizedExternal

  const filteredTournaments = sourceTournaments.filter((tournament) => {
    const matchesSearch =
      tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.game.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === "all" || tournament.game.toLowerCase().includes(selectedFilter)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">All Tournaments</h1>
          <p className="text-slate-400">Join tournaments and compete with players worldwide</p>
        </div>
        {isAdmin && (
          <Button onClick={onCreateTournament} className="bg-cyan-500 hover:bg-cyan-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Tournament
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="flex gap-2">
              {["all", "free fire", "pubg", "valorant"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  size="sm"
                  className={`${
                    selectedFilter === filter
                      ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                      : "border-slate-600 text-slate-300 hover:bg-slate-700"
                  } capitalize`}
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Tournaments Grid */}
      {filteredTournaments.length === 0 && (
        <Card className="bg-slate-800 border-slate-700 p-8 flex flex-col items-center justify-center text-center gap-4">
          <ImageOff className="w-10 h-10 text-slate-500" />
          <div>
            <h3 className="text-white font-semibold text-lg">No tournaments yet</h3>
            <p className="text-slate-400 text-sm">{isAdmin ? 'Create the first tournament to get started.' : 'Check back later for upcoming tournaments.'}</p>
          </div>
          {isAdmin && (
            <Button onClick={onCreateTournament} className="bg-cyan-500 hover:bg-cyan-600 text-white">
              <Plus className="w-4 h-4 mr-2" /> Create Tournament
            </Button>
          )}
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTournaments.map((tournament) => (
          <Card
            key={tournament.id}
            className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-colors group"
          >
            <div className="relative h-48">
              <img
                src={tournament.image || "/placeholder.svg"}
                alt={tournament.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <Badge className={`absolute top-3 left-3 ${getStatusColor(tournament.status)} text-white border-0`}>
                {getStatusText(tournament.status)}
              </Badge>
              <div className="absolute top-3 right-3 bg-black/50 px-2 py-1 rounded text-xs text-white">
                {tournament.players}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {tournament.icon}
                <h3 className="font-semibold text-white">{tournament.name}</h3>
              </div>
              <p className="text-sm text-slate-400 mb-4">{tournament.gameMode}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Entry Fee:</span>
                  <span className="text-white">₹{tournament.entryFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Prize Pool:</span>
                  <span className="text-cyan-400 font-semibold">₹{tournament.prizePool.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Starts in:</span>
                  <span
                    className={`${
                      tournament.status === "live"
                        ? "text-red-400"
                        : tournament.status === "open"
                          ? "text-green-400"
                          : "text-yellow-400"
                    }`}
                  >
                    {tournament.startTime}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => onJoinTournament(tournament.id, tournament.name, tournament.entryFee)}
                disabled={tournament.status === "soon"}
                className={`w-full ${
                  tournament.status === "soon"
                    ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                    : "bg-cyan-500 hover:bg-cyan-600 text-white"
                } transition-colors`}
              >
                {tournament.status === "soon" ? "Register Soon" : "Join Tournament"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Debug component for troubleshooting */}
      {process.env.NODE_ENV === 'development' && <TournamentJoinTest />}
    </div>
  )
}
