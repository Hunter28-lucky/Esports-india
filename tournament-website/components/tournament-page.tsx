"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Clock, Users, Trophy, Target, Zap, Calendar, Wallet } from "lucide-react"

interface TournamentSlot {
  id: string
  time: string
  date: string
  maxPlayers: number
  currentPlayers: number
  status: "open" | "filling" | "full"
  prizePool: number
}

interface TournamentPageProps {
  game: string
  onBack: () => void
  onJoinSlot: (slotId: string, entryFee: number) => void
  walletBalance: number
  onAddMoney: () => void
}

export function TournamentPage({ game, onBack, onJoinSlot, walletBalance, onAddMoney }: TournamentPageProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const gameData = {
    "Free Fire": {
      title: "Free Fire Championship",
      image: "/images/freefire-tournament.png",
      icon: <Zap className="w-6 h-6 text-orange-500" />,
      entryFee: 50,
      gameMode: "Squad • Battle Royale",
      description: "Join the ultimate Free Fire battle royale experience with squads of 4 players each.",
      rules: ["Squad of 4 players", "Battle Royale mode", "Bermuda map", "20 minutes max duration"],
    },
    "PUBG Mobile": {
      title: "PUBG Mobile Pro",
      image: "/images/pubg-tournament.png",
      icon: <Target className="w-6 h-6 text-blue-500" />,
      entryFee: 100,
      gameMode: "Solo • Classic",
      description: "Compete in classic PUBG Mobile solo matches with the best players.",
      rules: ["Solo gameplay", "Classic mode", "Erangel map", "30 minutes max duration"],
    },
    Valorant: {
      title: "Valorant Masters",
      image: "/images/valorant-tournament.png",
      icon: <Zap className="w-6 h-6 text-red-500" />,
      entryFee: 200,
      gameMode: "Team • Competitive",
      description: "5v5 tactical shooter tournament with the highest stakes.",
      rules: ["5v5 team matches", "Competitive mode", "Best of 3 rounds", "45 minutes max duration"],
    },
  }

  const tournamentSlots: TournamentSlot[] = [
    {
      id: "slot-1",
      time: "2:30 PM",
      date: "Today",
      maxPlayers: 100,
      currentPlayers: 87,
      status: "filling",
      prizePool: 4500,
    },
    {
      id: "slot-2",
      time: "4:00 PM",
      date: "Today",
      maxPlayers: 100,
      currentPlayers: 45,
      status: "open",
      prizePool: 4500,
    },
    {
      id: "slot-3",
      time: "6:30 PM",
      date: "Today",
      maxPlayers: 100,
      currentPlayers: 23,
      status: "open",
      prizePool: 4500,
    },
    {
      id: "slot-4",
      time: "8:00 PM",
      date: "Today",
      maxPlayers: 100,
      currentPlayers: 100,
      status: "full",
      prizePool: 4500,
    },
    {
      id: "slot-5",
      time: "10:30 AM",
      date: "Tomorrow",
      maxPlayers: 100,
      currentPlayers: 12,
      status: "open",
      prizePool: 5000,
    },
    {
      id: "slot-6",
      time: "2:00 PM",
      date: "Tomorrow",
      maxPlayers: 100,
      currentPlayers: 8,
      status: "open",
      prizePool: 5000,
    },
  ]

  const currentGame = gameData[game as keyof typeof gameData]

  const handleJoinSlot = (slotId: string) => {
    if (walletBalance < currentGame.entryFee) {
      // Show insufficient balance modal only when balance is insufficient
      const shouldAddMoney = confirm(
        `Insufficient balance! You need ₹${currentGame.entryFee} but have ₹${walletBalance}. Would you like to add money to your wallet?`,
      )
      if (shouldAddMoney) {
        onAddMoney()
      }
      return
    }

    // Automatically join tournament if sufficient balance
    setSelectedSlot(slotId)
    onJoinSlot(slotId, currentGame.entryFee)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-600"
      case "filling":
        return "bg-yellow-600"
      case "full":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "OPEN"
      case "filling":
        return "FILLING FAST"
      case "full":
        return "FULL"
      default:
        return "CLOSED"
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            {currentGame.icon}
            <div>
              <h1 className="text-xl font-bold text-white">{currentGame.title}</h1>
              <p className="text-sm text-slate-400">{currentGame.gameMode}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-slate-700 px-3 py-2 rounded-lg">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 font-semibold">₹{walletBalance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        {/* Game Info */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <div className="relative h-48 lg:h-64">
            <img
              src={currentGame.image || "/placeholder.svg"}
              alt={currentGame.title}
              className="w-full h-full object-cover rounded-t-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-cyan-600 text-white border-0">Entry Fee: ₹{currentGame.entryFee}</Badge>
                <Badge className="bg-purple-600 text-white border-0">Prize Pool: Up to ₹5,000</Badge>
              </div>
            </div>
          </div>
          <div className="p-4 lg:p-6">
            <p className="text-slate-300 mb-4">{currentGame.description}</p>
            <div>
              <h3 className="text-white font-semibold mb-2">Tournament Rules:</h3>
              <ul className="text-slate-400 text-sm space-y-1">
                {currentGame.rules.map((rule, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Available Slots */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Available Tournament Slots</h2>
          <div className="grid gap-4">
            {tournamentSlots.map((slot) => (
              <Card key={slot.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                <div className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center gap-2 text-white font-semibold">
                          <Calendar className="w-4 h-4 text-cyan-400" />
                          {slot.date}
                        </div>
                        <div className="flex items-center gap-2 text-lg font-bold text-cyan-400">
                          <Clock className="w-4 h-4" />
                          {slot.time}
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-600" />
                      <div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">
                            {slot.currentPlayers}/{slot.maxPlayers} players
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">Prize Pool: ₹{slot.prizePool.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(slot.status)} text-white border-0`}>
                        {getStatusText(slot.status)}
                      </Badge>
                      <Button
                        onClick={() => handleJoinSlot(slot.id)}
                        disabled={slot.status === "full" || walletBalance < currentGame.entryFee}
                        className={`${
                          slot.status === "full"
                            ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                            : walletBalance < currentGame.entryFee
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-cyan-500 hover:bg-cyan-600 text-white"
                        } transition-colors`}
                      >
                        {slot.status === "full"
                          ? "Full"
                          : walletBalance < currentGame.entryFee
                            ? "Add Money"
                            : `Join for ₹${currentGame.entryFee}`}
                      </Button>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        slot.status === "full"
                          ? "bg-red-500"
                          : slot.status === "filling"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${(slot.currentPlayers / slot.maxPlayers) * 100}%` }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Winners */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-4 lg:p-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent Winners</h3>
            <div className="space-y-3">
              {[
                { name: "ProGamer_X", prize: "₹4,500", time: "2 hours ago", rank: 1 },
                { name: "SniperQueen", prize: "₹2,250", time: "4 hours ago", rank: 2 },
                { name: "RushMaster", prize: "₹1,125", time: "6 hours ago", rank: 3 },
              ].map((winner, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black ${
                      winner.rank === 1 ? "bg-yellow-500" : winner.rank === 2 ? "bg-slate-400" : "bg-orange-500"
                    }`}
                  >
                    {winner.rank}
                  </div>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{winner.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{winner.name}</p>
                    <p className="text-slate-400 text-xs">{winner.time}</p>
                  </div>
                  <span className="text-green-400 font-semibold">{winner.prize}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
