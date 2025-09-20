"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Clock, Calendar, TrendingUp, TrendingDown, Award } from "lucide-react"

export function MatchHistorySection() {
  const [selectedFilter, setSelectedFilter] = useState("all")

  const matchHistory = [
    {
      id: "1",
      tournament: "Free Fire Championship #234",
      game: "Free Fire",
      gameMode: "Squad • Battle Royale",
      date: "2 hours ago",
      placement: 1,
      kills: 12,
      prize: 1500,
      status: "won",
      participants: 100,
      duration: "18m 32s",
    },
    {
      id: "2",
      tournament: "PUBG Mobile Pro League",
      game: "PUBG Mobile",
      gameMode: "Solo • Classic",
      date: "1 day ago",
      placement: 7,
      kills: 8,
      prize: 0,
      status: "lost",
      participants: 64,
      duration: "22m 15s",
    },
    {
      id: "3",
      tournament: "Free Fire Blitz Tournament",
      game: "Free Fire",
      gameMode: "Solo • Battle Royale",
      date: "2 days ago",
      placement: 3,
      kills: 15,
      prize: 800,
      status: "won",
      participants: 50,
      duration: "16m 45s",
    },
    {
      id: "4",
      tournament: "Valorant Masters Cup",
      game: "Valorant",
      gameMode: "Team • Competitive",
      date: "3 days ago",
      placement: 12,
      kills: 18,
      prize: 0,
      status: "lost",
      participants: 32,
      duration: "42m 18s",
    },
    {
      id: "5",
      tournament: "PUBG Squad Championship",
      game: "PUBG Mobile",
      gameMode: "Squad • Classic",
      date: "5 days ago",
      placement: 2,
      kills: 9,
      prize: 1200,
      status: "won",
      participants: 80,
      duration: "28m 52s",
    },
    {
      id: "6",
      tournament: "Free Fire Weekly Cup",
      game: "Free Fire",
      gameMode: "Squad • Battle Royale",
      date: "1 week ago",
      placement: 8,
      kills: 6,
      prize: 0,
      status: "lost",
      participants: 60,
      duration: "14m 23s",
    },
  ]

  const getPlacementColor = (placement: number, participants: number) => {
    const percentage = (placement / participants) * 100
    if (percentage <= 10) return "text-yellow-400" // Top 10%
    if (percentage <= 25) return "text-green-400" // Top 25%
    if (percentage <= 50) return "text-blue-400" // Top 50%
    return "text-slate-400" // Bottom 50%
  }

  const getPlacementBadge = (placement: number, participants: number) => {
    const percentage = (placement / participants) * 100
    if (percentage <= 10) return { text: "TOP 10%", color: "bg-yellow-600" }
    if (percentage <= 25) return { text: "TOP 25%", color: "bg-green-600" }
    if (percentage <= 50) return { text: "TOP 50%", color: "bg-blue-600" }
    return { text: "BOTTOM 50%", color: "bg-slate-600" }
  }

  const filteredMatches = matchHistory.filter((match) => {
    if (selectedFilter === "all") return true
    if (selectedFilter === "won") return match.status === "won"
    if (selectedFilter === "lost") return match.status === "lost"
    return match.game.toLowerCase().includes(selectedFilter)
  })

  const stats = {
    totalMatches: matchHistory.length,
    wins: matchHistory.filter((m) => m.status === "won").length,
    totalKills: matchHistory.reduce((sum, m) => sum + m.kills, 0),
    totalEarnings: matchHistory.reduce((sum, m) => sum + m.prize, 0),
    winRate: Math.round((matchHistory.filter((m) => m.status === "won").length / matchHistory.length) * 100),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Match History</h1>
          <p className="text-slate-400">Your tournament performance and statistics</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Matches</p>
              <p className="text-xl font-bold text-white">{stats.totalMatches}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Wins</p>
              <p className="text-xl font-bold text-white">{stats.wins}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Kills</p>
              <p className="text-xl font-bold text-white">{stats.totalKills}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Win Rate</p>
              <p className="text-xl font-bold text-white">{stats.winRate}%</p>
            </div>
          </div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Earnings</p>
              <p className="text-xl font-bold text-white">₹{stats.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All Matches" },
              { key: "won", label: "Wins" },
              { key: "lost", label: "Losses" },
              { key: "free fire", label: "Free Fire" },
              { key: "pubg", label: "PUBG Mobile" },
              { key: "valorant", label: "Valorant" },
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={selectedFilter === filter.key ? "default" : "outline"}
                size="sm"
                className={`${
                  selectedFilter === filter.key
                    ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                    : "border-slate-600 text-slate-300 hover:bg-slate-700"
                }`}
                onClick={() => setSelectedFilter(filter.key)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Match History */}
      <div className="space-y-4">
        {filteredMatches.map((match) => {
          const placementBadge = getPlacementBadge(match.placement, match.participants)
          return (
            <Card key={match.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold">{match.tournament}</h3>
                      <Badge className={`${placementBadge.color} text-white border-0 text-xs`}>
                        {placementBadge.text}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm mb-1">{match.gameMode}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {match.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {match.duration}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {match.status === "won" ? (
                      <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-400 mb-2" />
                    )}
                    {match.prize > 0 && <p className="text-green-400 font-semibold">+₹{match.prize}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Placement</p>
                    <p className={`text-2xl font-bold ${getPlacementColor(match.placement, match.participants)}`}>
                      #{match.placement}
                    </p>
                    <p className="text-slate-500 text-xs">of {match.participants}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Kills</p>
                    <p className="text-2xl font-bold text-orange-400">{match.kills}</p>
                    <p className="text-slate-500 text-xs">eliminations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">Prize</p>
                    <p className={`text-2xl font-bold ${match.prize > 0 ? "text-green-400" : "text-slate-500"}`}>
                      ₹{match.prize}
                    </p>
                    <p className="text-slate-500 text-xs">earned</p>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
