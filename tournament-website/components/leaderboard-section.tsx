"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Target, TrendingUp } from "lucide-react"

export function LeaderboardSection() {
  const [selectedPeriod, setSelectedPeriod] = useState("all-time")

  const leaderboardData = [
    {
      rank: 1,
      name: "ProGamer_X",
      avatar: "/images/avatar-progamer.png",
      totalEarnings: 45200,
      totalKills: 2847,
      totalWins: 89,
      winRate: 78,
      favoriteGame: "Free Fire",
      badge: "Champion",
    },
    {
      rank: 2,
      name: "SniperQueen",
      avatar: "/images/avatar-sniperqueen.png",
      totalEarnings: 38900,
      totalKills: 2234,
      totalWins: 67,
      winRate: 72,
      favoriteGame: "PUBG Mobile",
      badge: "Elite",
    },
    {
      rank: 3,
      name: "RushMaster",
      avatar: "/images/avatar-rushmaster.png",
      totalEarnings: 32100,
      totalKills: 1987,
      totalWins: 54,
      winRate: 68,
      favoriteGame: "Valorant",
      badge: "Pro",
    },
    {
      rank: 4,
      name: "HeadshotKing",
      avatar: "/images/avatar-progamer.png",
      totalEarnings: 28750,
      totalKills: 1756,
      totalWins: 48,
      winRate: 65,
      favoriteGame: "Free Fire",
      badge: "Expert",
    },
    {
      rank: 5,
      name: "StealthNinja",
      avatar: "/images/avatar-sniperqueen.png",
      totalEarnings: 24300,
      totalKills: 1543,
      totalWins: 42,
      winRate: 63,
      favoriteGame: "PUBG Mobile",
      badge: "Advanced",
    },
    {
      rank: 6,
      name: "BattleRoyale",
      avatar: "/images/avatar-rushmaster.png",
      totalEarnings: 21800,
      totalKills: 1432,
      totalWins: 38,
      winRate: 61,
      favoriteGame: "Free Fire",
      badge: "Skilled",
    },
    {
      rank: 7,
      name: "You (Alex Chen)",
      avatar: "/images/avatar-alexchen.png",
      totalEarnings: 18450,
      totalKills: 847,
      totalWins: 12,
      winRate: 45,
      favoriteGame: "Free Fire",
      badge: "Rising Star",
    },
  ]

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-black"
      case 2:
        return "bg-slate-400 text-black"
      case 3:
        return "bg-orange-500 text-black"
      default:
        return "bg-slate-600 text-white"
    }
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Champion":
        return "bg-yellow-600"
      case "Elite":
        return "bg-purple-600"
      case "Pro":
        return "bg-blue-600"
      case "Expert":
        return "bg-green-600"
      case "Advanced":
        return "bg-orange-600"
      case "Skilled":
        return "bg-cyan-600"
      default:
        return "bg-slate-600"
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          <p className="text-slate-400">Top players ranked by performance and earnings</p>
        </div>
        <div className="flex gap-2">
          {[
            { key: "all-time", label: "All Time" },
            { key: "monthly", label: "This Month" },
            { key: "weekly", label: "This Week" },
          ].map((period) => (
            <Button
              key={period.key}
              variant={selectedPeriod === period.key ? "default" : "outline"}
              size="sm"
              className={`${
                selectedPeriod === period.key
                  ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                  : "border-slate-600 text-slate-300 hover:bg-slate-700"
              }`}
              onClick={() => setSelectedPeriod(period.key)}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Champions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaderboardData.slice(0, 3).map((player, index) => (
              <div
                key={player.rank}
                className={`text-center ${index === 0 ? "md:order-2" : index === 1 ? "md:order-1" : "md:order-3"}`}
              >
                <div className="relative inline-block mb-4">
                  <Avatar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto border-4 border-slate-600">
                    <AvatarImage src={player.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${getRankColor(player.rank)}`}
                  >
                    {player.rank}
                  </div>
                </div>
                <h4 className="text-white font-semibold mb-1">{player.name}</h4>
                <Badge className={`${getBadgeColor(player.badge)} text-white border-0 mb-2`}>{player.badge}</Badge>
                <p className="text-2xl font-bold text-yellow-400 mb-1">₹{player.totalEarnings.toLocaleString()}</p>
                <p className="text-slate-400 text-sm">
                  {player.totalWins} wins • {player.winRate}% win rate
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Full Leaderboard */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Full Rankings</h3>
          <div className="space-y-3">
            {leaderboardData.map((player) => (
              <div
                key={player.rank}
                className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                  player.name.includes("You")
                    ? "bg-cyan-900/30 border border-cyan-600/30"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(player.rank)}`}
                >
                  {player.rank}
                </div>
                <Avatar className="w-12 h-12">
                  <AvatarImage src={player.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-semibold">{player.name}</h4>
                    <Badge className={`${getBadgeColor(player.badge)} text-white border-0 text-xs`}>
                      {player.badge}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {player.totalKills} kills
                    </span>
                    <span className="flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      {player.totalWins} wins
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {player.winRate}% win rate
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-yellow-400">₹{player.totalEarnings.toLocaleString()}</p>
                  <p className="text-slate-400 text-sm">{player.favoriteGame}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
