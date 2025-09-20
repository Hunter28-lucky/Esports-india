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
import { CelebrationEffects } from "./celebration-effects"
import { AchievementToast } from "./achievement-toast"
import { useToast } from "@/hooks/use-toast"
import { useHaptic } from "@/hooks/use-haptic"
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
  TrendingUp,
  Star,
  Clock,
  Users,
  Flame,
  CheckCircle,
  XCircle,
  Shield,
} from "lucide-react"

interface Notification {
  id: string
  type: "tournament_joined" | "tournament_starting" | "tournament_won" | "payment_success"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface Achievement {
  id: string
  title: string
  description: string
  type: "victory" | "streak" | "milestone" | "special"
  icon: "trophy" | "star" | "target" | "crown" | "zap" | "gift"
  rarity: "common" | "rare" | "epic" | "legendary"
}

export function GameArenaDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "tournament_won",
      title: "Tournament Victory!",
      message: "You won Free Fire Championship #234 and earned ₹1,500!",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
    },
  ])
  const [showNotifications, setShowNotifications] = useState(false)
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
  const [paymentStatus, setPaymentStatus] = useState<{
    status: "idle" | "processing" | "success" | "failed"
    message: string
  }>({ status: "idle", message: "" })

  const [celebrationTrigger, setCelebrationTrigger] = useState<{
    active: boolean
    type: "victory" | "money" | "achievement" | "streak"
  }>({ active: false, type: "victory" })

  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)
  const [winStreak, setWinStreak] = useState(3)
  const [totalWins, setTotalWins] = useState(12)

  const { toast } = useToast()
  const { triggerHaptic } = useHaptic()

  const [joinedTournaments, setJoinedTournaments] = useState<
    Array<{
      id: string
      name: string
      game: string
      entryFee: number
      joinedAt: Date
      status: "waiting" | "live" | "completed"
      roomId?: string
      password?: string
    }>
  >([])

  const [tournamentFlow, setTournamentFlow] = useState<{
    currentView: "dashboard" | "tournament-page" | "waiting-room"
    selectedGame?: string
    selectedSlot?: string
  }>({
    currentView: "dashboard",
  })

  const triggerAchievement = (achievement: Achievement) => {
    setCurrentAchievement(achievement)
    setCelebrationTrigger({ active: true, type: "achievement" })
    triggerHaptic("victory")
  }

  const handleNavClick = (navItem: string) => {
    triggerHaptic("button")
    setActiveNav(navItem)
    setIsMobileMenuOpen(false)
    setTournamentFlow({ currentView: "dashboard" })
  }

  const handleJoinTournament = (tournamentName: string, entryFee: number) => {
    triggerHaptic("medium")

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
      triggerHaptic("error")
      setPaymentModal({
        isOpen: true,
        type: "wallet",
      })
      return
    }

    setPaymentStatus({ status: "processing", message: "Processing tournament entry..." })

    triggerHaptic("join")

    // Simulate payment processing
    setTimeout(() => {
      // Deduct entry fee from wallet
      setWalletBalance((prev) => prev - entryFee)

      // Add to joined tournaments
      const newTournament = {
        id: `tournament-${Date.now()}`,
        name: `${tournamentFlow.selectedGame} Championship`,
        game: tournamentFlow.selectedGame || "Free Fire",
        entryFee,
        joinedAt: new Date(),
        status: "waiting" as const,
      }
      setJoinedTournaments((prev) => [...prev, newTournament])

      const joinNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: "tournament_joined",
        title: "Tournament Joined!",
        message: `Successfully joined ${newTournament.name} for ₹${entryFee}`,
        timestamp: new Date(),
        read: false,
      }
      setNotifications((prev) => [joinNotification, ...prev])

      toast({
        title: "🎉 Tournament Joined Successfully!",
        description: `Welcome to ${newTournament.name}! Get ready to dominate! 🔥`,
        variant: "default",
      })

      setPaymentStatus({ status: "success", message: "Successfully joined tournament!" })

      setCelebrationTrigger({ active: true, type: "victory" })

      // Check for achievements
      const totalTournaments = joinedTournaments.length + 1
      if (totalTournaments === 5) {
        triggerAchievement({
          id: "tournament-5",
          title: "Tournament Warrior",
          description: "Joined 5 tournaments",
          type: "milestone",
          icon: "trophy",
          rarity: "rare",
        })
      } else if (totalTournaments === 10) {
        triggerAchievement({
          id: "tournament-10",
          title: "Elite Competitor",
          description: "Joined 10 tournaments",
          type: "milestone",
          icon: "crown",
          rarity: "epic",
        })
      }

      // Navigate to waiting room
      setTournamentFlow({
        currentView: "waiting-room",
        selectedGame: tournamentFlow.selectedGame,
        selectedSlot: slotId,
      })

      triggerHaptic("victory")

      // Clear status after 3 seconds
      setTimeout(() => {
        setPaymentStatus({ status: "idle", message: "" })
      }, 3000)
    }, 2000)
  }

  const handleBackToTournaments = () => {
    triggerHaptic("button")
    setTournamentFlow({ currentView: "dashboard" })
  }

  const handleLeaveTournament = () => {
    const shouldLeave = confirm("Are you sure you want to leave this tournament? Your entry fee will not be refunded.")
    if (shouldLeave) {
      triggerHaptic("warning")
      setTournamentFlow({ currentView: "dashboard" })
    }
  }

  const handleAddMoney = () => {
    triggerHaptic("button")
    setPaymentModal({
      isOpen: true,
      type: "wallet",
    })
  }

  const handleCreateTournament = () => {
    triggerHaptic("medium")
    alert("Opening tournament creation form...")
  }

  const handleNotificationClick = () => {
    triggerHaptic("notification")
    setShowNotifications(!showNotifications)
    if (!showNotifications) {
      // Mark all notifications as read when opening
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
    }
  }

  const toggleMobileMenu = () => {
    triggerHaptic("button")
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handlePaymentSuccess = (amount: number) => {
    setPaymentStatus({ status: "processing", message: "Processing payment..." })

    triggerHaptic("medium")

    setTimeout(() => {
      if (paymentModal.type === "wallet") {
        setWalletBalance((prev) => prev + amount)

        const paymentNotification: Notification = {
          id: `payment-${Date.now()}`,
          type: "payment_success",
          title: "Payment Successful!",
          message: `₹${amount} added to your wallet successfully!`,
          timestamp: new Date(),
          read: false,
        }
        setNotifications((prev) => [paymentNotification, ...prev])

        toast({
          title: "💰 Money Added Successfully!",
          description: `₹${amount} has been added to your wallet! Ready to dominate? 🚀`,
          variant: "default",
        })

        setPaymentStatus({ status: "success", message: `₹${amount} added successfully!` })

        setCelebrationTrigger({ active: true, type: "money" })

        // Check for wallet milestones
        const newBalance = walletBalance + amount
        if (newBalance >= 5000 && walletBalance < 5000) {
          triggerAchievement({
            id: "wallet-5k",
            title: "High Roller",
            description: "Reached ₹5,000 wallet balance",
            type: "milestone",
            icon: "gift",
            rarity: "epic",
          })
        }

        triggerHaptic("success")
      }
      setPaymentModal({ isOpen: false, type: "wallet" })

      setTimeout(() => {
        setPaymentStatus({ status: "idle", message: "" })
      }, 3000)
    }, 1500)
  }

  const handlePaymentClose = () => {
    triggerHaptic("button")
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
            {paymentStatus.status !== "idle" && (
              <div
                className={`mb-6 p-4 rounded-xl border animate-slide-up ${
                  paymentStatus.status === "success"
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : paymentStatus.status === "failed"
                      ? "bg-red-500/10 border-red-500/30 text-red-400"
                      : "bg-primary/10 border-primary/30 text-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  {paymentStatus.status === "processing" && (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  {paymentStatus.status === "success" && <CheckCircle className="w-5 h-5 animate-victory-bounce" />}
                  {paymentStatus.status === "failed" && <XCircle className="w-5 h-5" />}
                  <span className="font-semibold">{paymentStatus.message}</span>
                </div>
              </div>
            )}

            {joinedTournaments.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <Shield className="w-6 h-6 text-primary" />
                      My Tournaments
                    </h2>
                    <p className="text-muted-foreground">Track your active and completed tournaments</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {joinedTournaments.map((tournament) => (
                    <Card key={tournament.id} className="bg-card border-primary/20 p-4 card-hover animate-slide-up">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">{tournament.name}</h3>
                        <Badge
                          className={`text-xs animate-pulse ${
                            tournament.status === "waiting"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : tournament.status === "live"
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : "bg-green-500/20 text-green-400 border-green-500/30"
                          }`}
                        >
                          {tournament.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Game:</span>
                          <span className="text-foreground">{tournament.game}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Entry Fee:</span>
                          <span className="text-foreground">₹{tournament.entryFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Joined:</span>
                          <span className="text-foreground">{tournament.joinedAt.toLocaleDateString()}</span>
                        </div>
                        {tournament.roomId && (
                          <div className="mt-3 p-2 bg-primary/10 rounded border border-primary/20">
                            <div className="text-xs text-muted-foreground mb-1">Room Details:</div>
                            <div className="text-xs">ID: {tournament.roomId}</div>
                            <div className="text-xs">Password: {tournament.password}</div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Hero Section with Free Fire Banner */}
            <section className="mb-8 relative overflow-hidden rounded-xl border border-primary/30">
              <div className="relative h-64 md:h-80">
                <img
                  src="/free-fire-championship-tournament-esports.jpg"
                  alt="Free Fire Championship Tournament - Elite esports competition with massive prize pools"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 flex items-center">
                  <div className="p-6 md:p-8 max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center animate-fire-pulse">
                        <Flame className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-4xl font-bold text-white text-glow">ELITE TOURNAMENT SEASON</h2>
                        <p className="text-gray-200 text-sm md:text-base">
                          Dominate the competition - Claim your throne!
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 font-bold animate-pulse">Season ends in 3 days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-white font-medium">2,847 elite warriors</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-bold animate-coin-flip">₹2.5M+ prize pool</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Cards with Enhanced Matte Black Design */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8" aria-label="Player Statistics">
              <Card className="bg-card border-primary/30 p-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group gradient-border-red card-hover">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">TOURNAMENTS</p>
                      <p className="text-3xl font-bold text-foreground">24</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400 font-medium animate-pulse">+12% this week</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-colors animate-victory-bounce">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-card border-border p-6 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 group card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">WIN RATE</p>
                    <p className="text-3xl font-bold text-foreground">50%</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-red-400" />
                      <span className="text-xs text-red-400 font-medium">Elite tier</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                    <Crown className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </Card>

              <Card className="bg-card border-border p-6 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 group card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">TOTAL KILLS</p>
                    <p className="text-3xl font-bold text-foreground">847</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Zap className="w-3 h-3 text-orange-400" />
                      <span className="text-xs text-orange-400 font-medium">Sharpshooter</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                    <Target className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </Card>

              <Card className="bg-card border-primary/30 p-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group gradient-border-gold card-hover-gold">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">TOTAL WINNINGS</p>
                    <p className="text-3xl font-bold text-foreground text-glow-gold">₹18,450</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400 font-medium animate-coin-flip">+₹2,450 today</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-colors animate-level-up">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </Card>
            </section>

            {/* Win Streak Display */}
            {winStreak > 0 && (
              <section className="mb-8">
                <Card className="bg-gradient-to-r from-green-500/10 to-yellow-500/10 border-green-500/30 p-4 animate-streak-glow">
                  <div className="flex items-center justify-center gap-3">
                    <Flame className="w-6 h-6 text-yellow-400 animate-fire-pulse" />
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-glow-green">🔥 WIN STREAK: {winStreak} 🔥</h3>
                      <p className="text-muted-foreground text-sm">You're on fire! Keep the momentum going!</p>
                    </div>
                    <Flame className="w-6 h-6 text-yellow-400 animate-fire-pulse" />
                  </div>
                </Card>
              </section>
            )}

            {/* Live Tournaments Section - Enhanced for aggressive design */}
            <section className="mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 text-glow">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    LIVE BATTLEGROUNDS
                  </h2>
                  <p className="text-muted-foreground">Enter the arena - Prove your dominance</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/30 text-muted-foreground hover:bg-primary hover:text-primary-foreground flex-1 sm:flex-none bg-transparent"
                  >
                    All Games
                  </Button>
                  <Button
                    onClick={handleCreateTournament}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors flex-1 sm:flex-none font-bold animate-pulse-red"
                  >
                    <Plus className="w-4 h-4 sm:hidden" />
                    <span className="hidden sm:inline">CREATE TOURNAMENT</span>
                    <span className="sm:hidden">CREATE</span>
                  </Button>
                </div>
              </div>

              {/* Tournament cards remain the same but with enhanced hover effects */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Premium Tournament Card */}
                <article className="bg-card border-primary/30 overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group relative card-hover animate-slide-up">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-red-500"></div>
                  {/* ... existing tournament card content ... */}
                  <div className="relative h-48">
                    <img
                      src="/free-fire-championship-tournament-esports.jpg"
                      alt="Free Fire Championship Tournament - Battle Royale competition with ₹4,500 prize pool"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0 text-xs animate-pulse font-bold">
                      🔴 LIVE
                    </Badge>
                    <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded text-xs text-white font-medium">
                      87/100
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2">
                        <div className="flex items-center gap-2 text-white text-xs">
                          <Clock className="w-3 h-3" />
                          <span>Starts in 2h 15m</span>
                          <div className="ml-auto flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>87 joined</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-foreground">FREE FIRE CHAMPIONSHIP</h3>
                      <Badge
                        variant="secondary"
                        className="ml-auto text-xs bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
                      >
                        HOT
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Squad • Battle Royale • Elite Tier</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entry Fee:</span>
                        <span className="text-foreground font-medium">₹50</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Prize Pool:</span>
                        <span className="text-primary font-bold animate-coin-flip">₹4,500</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Winner Takes:</span>
                        <span className="text-green-400 font-bold text-glow-green">₹2,250</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleJoinTournament("Free Fire Championship", 50)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 font-bold animate-pulse-red"
                      size="sm"
                    >
                      JOIN BATTLE - ₹50
                    </Button>
                  </div>
                </article>

                {/* Similar updates for other tournament cards... */}
                {/* High Stakes Tournament */}
                <article className="bg-card border-accent/30 overflow-hidden hover:border-accent/50 transition-all duration-300 group card-hover animate-slide-up">
                  <div className="relative h-48">
                    <img
                      src="/pubg-mobile-pro-tournament-esports.jpg"
                      alt="PUBG Mobile Pro Tournament - Solo competitive gaming with ₹5,800 prize pool"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-green-500 text-white border-0 text-xs font-bold">
                      ✅ OPEN
                    </Badge>
                    <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded text-xs text-white font-medium">
                      45/64
                    </div>
                    <Badge className="absolute bottom-3 left-3 bg-accent text-accent-foreground text-xs font-bold animate-pulse">
                      HIGH STAKES
                    </Badge>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-accent" />
                      <h3 className="font-bold text-foreground">PUBG MOBILE PRO</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Solo • Classic • Pro League</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entry Fee:</span>
                        <span className="text-foreground font-medium">₹100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Prize Pool:</span>
                        <span className="text-accent font-bold">₹5,800</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Starts in:</span>
                        <span className="text-green-400 font-medium">45m</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleJoinTournament("PUBG Mobile Pro", 100)}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-300 font-bold"
                      size="sm"
                    >
                      JOIN BATTLE - ₹100
                    </Button>
                  </div>
                </article>

                {/* Upcoming Premium Tournament */}
                <article className="bg-card border-border overflow-hidden hover:border-primary/30 transition-all duration-300 group md:col-span-2 xl:col-span-1 card-hover animate-slide-up">
                  <div className="relative h-48">
                    <img
                      src="/valorant-masters-tournament-esports.jpg"
                      alt="Valorant Masters Tournament - Team competitive esports with ₹8,500 prize pool"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-yellow-500 text-black border-0 text-xs font-bold animate-pulse">
                      ⏰ SOON
                    </Badge>
                    <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded text-xs text-white font-medium">
                      12/50
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <h3 className="font-bold text-foreground">VALORANT MASTERS</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Team • Competitive • Masters Tier</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entry Fee:</span>
                        <span className="text-foreground font-medium">₹200</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Prize Pool:</span>
                        <span className="text-yellow-500 font-bold">₹8,500</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Starts in:</span>
                        <span className="text-yellow-400 font-medium">6h 30m</span>
                      </div>
                    </div>
                    <Button className="w-full bg-muted text-muted-foreground cursor-not-allowed" disabled size="sm">
                      REGISTRATION OPENS SOON
                    </Button>
                  </div>
                </article>
              </div>
            </section>

            {/* Bottom Section with Social Proof */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <article className="bg-card border-border p-6 animate-slide-up">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20 animate-victory-bounce">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">Won Free Fire Tournament #234</p>
                      <p className="text-green-500 text-sm font-semibold text-glow-green">2 hours ago • +₹1,500 💰</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">Joined PUBG Pro League</p>
                      <p className="text-muted-foreground text-sm">5 hours ago • Rank #7</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                    <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">Added money to wallet</p>
                      <p className="text-muted-foreground text-sm">1 day ago • +₹2,000</p>
                    </div>
                  </div>
                </div>
              </article>

              <article className="bg-card border-border p-6 animate-slide-up">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500 animate-level-up" />
                  Elite Leaderboard
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 gradient-border-gold">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black animate-coin-flip">
                        1
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="/pro-gamer-avatar.jpg" alt="ProGamer_X avatar" />
                        <AvatarFallback>PG</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-foreground font-medium">ProGamer_X</p>
                        <p className="text-muted-foreground text-xs">2,847 kills • 89 wins</p>
                      </div>
                    </div>
                    <span className="text-yellow-500 font-bold text-glow-gold">₹45,200</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 h-6 bg-muted-foreground rounded-full flex items-center justify-center text-xs font-bold text-background">
                        2
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="/placeholder-ep4rt.png" alt="SniperQueen avatar" />
                        <AvatarFallback>SQ</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-foreground font-medium">SniperQueen</p>
                        <p className="text-muted-foreground text-xs">2,234 kills • 67 wins</p>
                      </div>
                    </div>
                    <span className="text-muted-foreground font-semibold">₹38,900</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        3
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="/placeholder-r1xb5.png" alt="RushMaster avatar" />
                        <AvatarFallback>RM</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-foreground font-medium">RushMaster</p>
                        <p className="text-muted-foreground text-xs">1,987 kills • 54 wins</p>
                      </div>
                    </div>
                    <span className="text-orange-500 font-semibold">₹32,100</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20 animate-pulse-red">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                        7
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="/placeholder-3t9qp.png" alt="Alex Chen avatar" />
                        <AvatarFallback>AC</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-foreground font-medium">You (Alex Chen)</p>
                        <p className="text-muted-foreground text-xs">847 kills • {totalWins} wins</p>
                      </div>
                    </div>
                    <span className="text-primary font-bold text-glow">₹18,450</span>
                  </div>
                </div>
              </article>
            </section>
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
    <div className="min-h-screen bg-background text-foreground">
      <CelebrationEffects
        trigger={celebrationTrigger.active}
        type={celebrationTrigger.type}
        onComplete={() => setCelebrationTrigger({ active: false, type: "victory" })}
      />

      <AchievementToast achievement={currentAchievement} onClose={() => setCurrentAchievement(null)} />

      <header className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4 bg-card border-b border-border backdrop-blur-sm">
        <div className="flex items-center gap-3 lg:gap-4">
          <Button variant="ghost" size="sm" className="lg:hidden p-2" onClick={toggleMobileMenu}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-xl flex items-center justify-center animate-pulse-red">
              <Trophy className="w-4 h-4 lg:w-6 lg:h-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold text-foreground">GameArena Pro</h1>
              <p className="text-xs lg:text-sm text-muted-foreground">Elite Tournament Platform</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4 ml-8">
            <span className="text-foreground font-semibold">{activeNav}</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48 lg:w-64 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-colors"
            />
          </div>
          <Button variant="ghost" size="sm" className="md:hidden p-2">
            <Search className="w-4 h-4" />
          </Button>

          <div className="relative">
            <Button variant="ghost" size="sm" className="p-2 relative" onClick={handleNotificationClick}>
              <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground hover:text-foreground transition-colors" />
              {notifications.filter((n) => !n.read).length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{notifications.filter((n) => !n.read).length}</span>
                </div>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto animate-slide-up">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No notifications yet</div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors ${
                          !notification.read ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 animate-pulse ${
                              notification.type === "tournament_joined"
                                ? "bg-blue-500"
                                : notification.type === "tournament_won"
                                  ? "bg-green-500"
                                  : notification.type === "payment_success"
                                    ? "bg-yellow-500"
                                    : "bg-primary"
                            }`}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground text-sm">{notification.title}</h4>
                            <p className="text-muted-foreground text-xs mt-1">{notification.message}</p>
                            <p className="text-muted-foreground text-xs mt-2">
                              {notification.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 lg:gap-2 bg-card border border-primary/30 px-2 lg:px-3 py-1 lg:py-2 rounded-lg animate-coin-flip">
            <Wallet className="w-3 h-3 lg:w-4 lg:h-4 text-primary" />
            <span className="text-foreground font-bold text-sm lg:text-base text-glow-gold">
              ₹{walletBalance.toLocaleString()}
            </span>
          </div>
          <Button
            onClick={handleAddMoney}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors text-xs lg:text-sm px-2 lg:px-4 font-semibold animate-pulse-red"
          >
            <span className="hidden sm:inline">Add Money</span>
            <Plus className="w-4 h-4 sm:hidden" />
          </Button>
        </div>
      </header>

      {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />}

      <div className="flex relative">
        <nav
          className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
          <div className="flex items-center justify-between p-4 lg:hidden">
            <span className="text-foreground font-semibold">{activeNav}</span>
            <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="p-4 space-y-2">
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
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20 animate-pulse-red"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className={isActive ? "font-semibold" : ""}>{item.name}</span>
                </div>
              )
            })}
          </div>
        </nav>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleMobileMenu} />
        )}
        <main className="flex-1 p-4 lg:p-6 min-h-screen">{renderContent()}</main>
      </div>
      <footer className="fixed bottom-4 left-4 right-4 lg:right-auto">
        <div className="flex items-center gap-3 bg-card border border-border p-3 rounded-lg hover:border-primary/30 transition-colors cursor-pointer touch-manipulation lg:w-auto backdrop-blur-sm card-hover">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/placeholder-d8fkw.png" alt="Alex Chen profile picture" />
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-foreground font-semibold text-sm lg:text-base">Alex Chen</p>
            <p className="text-primary text-xs lg:text-sm font-medium text-glow">Elite Player</p>
          </div>
        </div>
      </footer>
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
