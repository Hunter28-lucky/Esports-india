"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PaymentPortal } from "./payment-portal"
import { TournamentPage } from "./tournament-page"
import { TournamentWaitingRoom } from "./tournament-waiting-room"
import { WalletSection } from "./wallet-section"
import { TournamentsSection } from "./tournaments-section"
import { LeaderboardSection } from "./leaderboard-section"
import { MatchHistorySection } from "./match-history-section"
import { ProfileSection } from "./profile-section"
import {
  Home,
  Trophy,
  Wallet,
  BarChart3,
  History,
  User,
  Search,
  Bell,
  Plus,
  Crown,
  Target,
  Zap,
  Gift,
  Menu,
  X,
} from "lucide-react"

export function GameArenaDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState(1)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean
    type: "wallet" | "tournament"
    tournamentName?: string
    entryFee?: number
  }>({
    isOpen: false,
    type: "wallet",
  })
  const [walletBalance, setWalletBalance] = useState(2450)

  const [tournamentFlow, setTournamentFlow] = useState<{
    currentView: "dashboard" | "tournament-page" | "waiting-room"
    selectedGame?: string
    selectedSlot?: string
  }>({
    currentView: "dashboard",
  })

  const handleNavClick = (navItem: string) => {
    setActiveNav(navItem)
    setIsMobileMenuOpen(false)
    setTournamentFlow({ currentView: "dashboard" })
  }

  const handleJoinTournament = (tournamentName: string, entryFee: number) => {
    const gameMap: { [key: string]: string } = {
      "Free Fire Championship": "Free Fire",
      "PUBG Mobile Pro": "PUBG Mobile",
      "Valorant Masters": "Valorant",
    }

    const game = gameMap[tournamentName] || "Free Fire"
    setTournamentFlow({
      currentView: "tournament-page",
      selectedGame: game,
    })
  }

  const handleJoinSlot = (slotId: string, entryFee: number) => {
    if (walletBalance < entryFee) {
      setPaymentModal({
        isOpen: true,
        type: "wallet",
      })
      return
    }

    // Deduct entry fee from wallet
    setWalletBalance((prev) => prev - entryFee)

    // Navigate to waiting room
    setTournamentFlow({
      currentView: "waiting-room",
      selectedGame: tournamentFlow.selectedGame,
      selectedSlot: slotId,
    })
  }

  const handleBackToTournaments = () => {
    setTournamentFlow({ currentView: "dashboard" })
  }

  const handleLeaveTournament = () => {
    const shouldLeave = confirm("Are you sure you want to leave this tournament? Your entry fee will not be refunded.")
    if (shouldLeave) {
      setTournamentFlow({ currentView: "dashboard" })
    }
  }

  const handleAddMoney = () => {
    setPaymentModal({
      isOpen: true,
      type: "wallet",
    })
  }

  const handleCreateTournament = () => {
    alert("Opening tournament creation form...")
  }

  const handleNotificationClick = () => {
    setNotifications(0)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handlePaymentSuccess = (amount: number) => {
    if (paymentModal.type === "wallet") {
      setWalletBalance((prev) => prev + amount)
    }
    setPaymentModal({ isOpen: false, type: "wallet" })
  }

  const handlePaymentClose = () => {
    setPaymentModal({ isOpen: false, type: "wallet" })
  }

  const renderContent = () => {
    switch (activeNav) {
      case "Wallet":
        return <WalletSection walletBalance={walletBalance} onAddMoney={handleAddMoney} />
      case "Tournaments":
        return (
          <TournamentsSection onJoinTournament={handleJoinTournament} onCreateTournament={handleCreateTournament} />
        )
      case "Leaderboard":
        return <LeaderboardSection />
      case "Match History":
        return <MatchHistorySection />
      case "Profile":
        return <ProfileSection />
      default:
        return (
          <>
            {/* Dashboard content - existing stats cards and tournaments */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
              <Card className="bg-slate-800 border-slate-700 p-4 lg:p-6 hover:bg-slate-750 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs lg:text-sm">Total Tournaments</p>
                    <p className="text-xl lg:text-3xl font-bold text-white">24</p>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
              </Card>
              <Card className="bg-slate-800 border-slate-700 p-4 lg:p-6 hover:bg-slate-750 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs lg:text-sm">Wins</p>
                    <p className="text-xl lg:text-3xl font-bold text-white">12</p>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <Crown className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
              </Card>
              <Card className="bg-slate-800 border-slate-700 p-4 lg:p-6 hover:bg-slate-750 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs lg:text-sm">Total Kills</p>
                    <p className="text-xl lg:text-3xl font-bold text-white">847</p>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
              </Card>
              <Card className="bg-slate-800 border-slate-700 p-4 lg:p-6 hover:bg-slate-750 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs lg:text-sm">Winnings</p>
                    <p className="text-xl lg:text-3xl font-bold text-white">₹18,450</p>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Gift className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
              </Card>
            </div>
            <div className="mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">Live Tournaments</h2>
                <div className="flex gap-2 lg:gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent flex-1 sm:flex-none"
                  >
                    All Games
                  </Button>
                  <Button
                    onClick={handleCreateTournament}
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white transition-colors flex-1 sm:flex-none"
                  >
                    <Plus className="w-4 h-4 sm:hidden" />
                    <span className="hidden sm:inline">Create Tournament</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                <Card className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-colors group">
                  <div className="relative h-32 sm:h-40 lg:h-48">
                    <img
                      src="/images/freefire-tournament.png"
                      alt="Free Fire Championship"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 lg:top-3 left-2 lg:left-3 bg-red-600 text-white border-0 text-xs">
                      LIVE
                    </Badge>
                    <div className="absolute top-2 lg:top-3 right-2 lg:right-3 bg-black/50 px-2 py-1 rounded text-xs text-white">
                      87/100
                    </div>
                  </div>
                  <div className="p-3 lg:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <h3 className="font-semibold text-white text-sm lg:text-base">Free Fire Championship</h3>
                    </div>
                    <p className="text-xs lg:text-sm text-slate-400 mb-3 lg:mb-4">Squad • Battle Royale</p>
                    <div className="space-y-1 lg:space-y-2 mb-3 lg:mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Entry Fee:</span>
                        <span className="text-white">₹50</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Prize Pool:</span>
                        <span className="text-cyan-400 font-semibold">₹4,500</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Starts in:</span>
                        <span className="text-orange-400">2h 15m</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleJoinTournament("Free Fire Championship", 50)}
                      className="w-full bg-cyan-500 hover:bg-cyan-600 text-white transition-colors text-sm touch-manipulation"
                      size="sm"
                    >
                      Join Tournament
                    </Button>
                  </div>
                </Card>
                <Card className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-colors group">
                  <div className="relative h-32 sm:h-40 lg:h-48">
                    <img
                      src="/images/pubg-tournament.png"
                      alt="PUBG Mobile Pro"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 lg:top-3 left-2 lg:left-3 bg-green-600 text-white border-0 text-xs">
                      OPEN
                    </Badge>
                    <div className="absolute top-2 lg:top-3 right-2 lg:right-3 bg-black/50 px-2 py-1 rounded text-xs text-white">
                      45/64
                    </div>
                  </div>
                  <div className="p-3 lg:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-500" />
                      <h3 className="font-semibold text-white text-sm lg:text-base">PUBG Mobile Pro</h3>
                    </div>
                    <p className="text-xs lg:text-sm text-slate-400 mb-3 lg:mb-4">Solo • Classic</p>
                    <div className="space-y-1 lg:space-y-2 mb-3 lg:mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Entry Fee:</span>
                        <span className="text-white">₹100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Prize Pool:</span>
                        <span className="text-cyan-400 font-semibold">₹5,800</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Starts in:</span>
                        <span className="text-green-400">45m</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleJoinTournament("PUBG Mobile Pro", 100)}
                      className="w-full bg-cyan-500 hover:bg-cyan-600 text-white transition-colors text-sm touch-manipulation"
                      size="sm"
                    >
                      Join Tournament
                    </Button>
                  </div>
                </Card>
                <Card className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-colors group md:col-span-2 xl:col-span-1">
                  <div className="relative h-32 sm:h-40 lg:h-48">
                    <img
                      src="/images/valorant-tournament.png"
                      alt="Valorant Masters"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 lg:top-3 left-2 lg:left-3 bg-yellow-600 text-white border-0 text-xs">
                      SOON
                    </Badge>
                    <div className="absolute top-2 lg:top-3 right-2 lg:right-3 bg-black/50 px-2 py-1 rounded text-xs text-white">
                      12/50
                    </div>
                  </div>
                  <div className="p-3 lg:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-red-500" />
                      <h3 className="font-semibold text-white text-sm lg:text-base">Valorant Masters</h3>
                    </div>
                    <p className="text-xs lg:text-sm text-slate-400 mb-3 lg:mb-4">Team • Competitive</p>
                    <div className="space-y-1 lg:space-y-2 mb-3 lg:mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Entry Fee:</span>
                        <span className="text-white">₹200</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Prize Pool:</span>
                        <span className="text-cyan-400 font-semibold">₹8,500</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Starts in:</span>
                        <span className="text-yellow-400">6h 30m</span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-slate-600 text-slate-300 cursor-not-allowed text-sm"
                      disabled
                      size="sm"
                    >
                      Register Soon
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card className="bg-slate-800 border-slate-700 p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-bold text-white mb-3 lg:mb-4">Recent Activity</h3>
                <div className="space-y-2 lg:space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer touch-manipulation">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm lg:text-base truncate">
                        Won Free Fire Tournament #234
                      </p>
                      <p className="text-slate-400 text-xs lg:text-sm">2 hours ago • +₹1,500</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer touch-manipulation">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm lg:text-base truncate">Joined PUBG Pro League</p>
                      <p className="text-slate-400 text-xs lg:text-sm">5 hours ago • +100</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer touch-manipulation">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm lg:text-base truncate">Added money to wallet</p>
                      <p className="text-slate-400 text-xs lg:text-sm">1 day ago • +₹2,000</p>
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="bg-slate-800 border-slate-700 p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-bold text-white mb-3 lg:mb-4">Top Players</h3>
                <div className="space-y-2 lg:space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer touch-manipulation">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
                        1
                      </div>
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src="/images/avatar-progamer.png" />
                        <AvatarFallback>PG</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium text-sm lg:text-base truncate">ProGamer_X</p>
                        <p className="text-slate-400 text-xs truncate">2,847 kills • 89 wins</p>
                      </div>
                    </div>
                    <span className="text-yellow-400 font-semibold text-sm lg:text-base flex-shrink-0">₹45,200</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer touch-manipulation">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
                        2
                      </div>
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src="/images/avatar-sniperqueen.png" />
                        <AvatarFallback>SQ</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium text-sm lg:text-base truncate">SniperQueen</p>
                        <p className="text-slate-400 text-xs truncate">2,234 kills • 67 wins</p>
                      </div>
                    </div>
                    <span className="text-slate-300 font-semibold text-sm lg:text-base flex-shrink-0">₹38,900</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer touch-manipulation">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
                        3
                      </div>
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src="/images/avatar-rushmaster.png" />
                        <AvatarFallback>RM</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium text-sm lg:text-base truncate">RushMaster</p>
                        <p className="text-slate-400 text-xs">1,987 kills • 54 wins</p>
                      </div>
                    </div>
                    <span className="text-orange-400 font-semibold text-sm lg:text-base flex-shrink-0">₹32,100</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer touch-manipulation">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
                        7
                      </div>
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src="/images/avatar-alexchen.png" />
                        <AvatarFallback>AC</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium text-sm lg:text-base truncate">You (Alex Chen)</p>
                        <p className="text-slate-400 text-xs">847 kills • 12 wins</p>
                      </div>
                    </div>
                    <span className="text-cyan-400 font-semibold text-sm lg:text-base flex-shrink-0">₹18,450</span>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )
    }
  }

  if (tournamentFlow.currentView === "tournament-page" && tournamentFlow.selectedGame) {
    return (
      <TournamentPage
        game={tournamentFlow.selectedGame}
        onBack={handleBackToTournaments}
        onJoinSlot={handleJoinSlot}
        walletBalance={walletBalance}
        onAddMoney={handleAddMoney}
      />
    )
  }

  if (tournamentFlow.currentView === "waiting-room" && tournamentFlow.selectedGame) {
    return (
      <TournamentWaitingRoom
        tournamentName={`${tournamentFlow.selectedGame} Championship`}
        slotId={tournamentFlow.selectedSlot || ""}
        onBack={handleBackToTournaments}
        onLeaveTournament={handleLeaveTournament}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3 lg:gap-4">
          <Button variant="ghost" size="sm" className="lg:hidden p-2" onClick={toggleMobileMenu}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold text-white">GameArena</h1>
              <p className="text-xs lg:text-sm text-slate-400">Tournament Platform</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4 ml-8">
            <span className="text-white font-semibold">{activeNav}</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-300">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48 lg:w-64 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 transition-colors"
            />
          </div>
          <Button variant="ghost" size="sm" className="md:hidden p-2">
            <Search className="w-4 h-4" />
          </Button>
          <div className="relative cursor-pointer" onClick={handleNotificationClick}>
            <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-slate-300 hover:text-white transition-colors" />
            {notifications > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <div className="flex items-center gap-1 lg:gap-2 bg-slate-700 px-2 lg:px-3 py-1 lg:py-2 rounded-lg">
            <Wallet className="w-3 h-3 lg:w-4 lg:h-4 text-cyan-400" />
            <span className="text-cyan-400 font-semibold text-sm lg:text-base">₹{walletBalance.toLocaleString()}</span>
          </div>
          <Button
            onClick={handleAddMoney}
            size="sm"
            className="bg-cyan-500 hover:bg-cyan-600 text-white transition-colors text-xs lg:text-sm px-2 lg:px-4"
          >
            <span className="hidden sm:inline">Add Money</span>
            <Plus className="w-4 h-4 sm:hidden" />
          </Button>
        </div>
      </header>
      <div className="flex relative">
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
          <div className="flex items-center justify-between p-4 lg:hidden">
            <span className="text-white font-semibold">{activeNav}</span>
            <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {[
              { name: "Dashboard", icon: Home },
              { name: "Tournaments", icon: Trophy },
              { name: "Wallet", icon: Wallet },
              { name: "Leaderboard", icon: BarChart3 },
              { name: "Match History", icon: History },
              { name: "Profile", icon: User },
            ].map((item) => {
              const Icon = item.icon
              const isActive = activeNav === item.name
              return (
                <div
                  key={item.name}
                  onClick={() => handleNavClick(item.name)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors touch-manipulation ${
                    isActive ? "bg-slate-700 text-cyan-400" : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className={isActive ? "font-medium" : ""}>{item.name}</span>
                </div>
              )
            })}
          </nav>
        </aside>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleMobileMenu} />
        )}
        <main className="flex-1 p-4 lg:p-6 min-h-screen">{renderContent()}</main>
      </div>
      <div className="fixed bottom-4 left-4 right-4 lg:right-auto">
        <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer touch-manipulation lg:w-auto">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src="/images/avatar-alexchen.png" />
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-white font-medium text-sm lg:text-base truncate">Alex Chen</p>
            <p className="text-slate-400 text-xs lg:text-sm">Pro Player</p>
          </div>
        </div>
      </div>
      <PaymentPortal
        isOpen={paymentModal.isOpen}
        onClose={handlePaymentClose}
        paymentType={paymentModal.type}
        tournamentName={paymentModal.tournamentName}
        entryFee={paymentModal.entryFee}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
