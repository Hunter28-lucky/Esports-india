"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PaymentPortal } from "./payment-portal"
import { TournamentPage } from "./tournament-page"
import { TournamentWaitingRoomSimple } from "./tournament-waiting-room-simple"
import MyTournaments from "./my-tournaments"
import { WalletSection } from "./wallet-section"
import { TournamentsSection } from "./tournaments-section"
import { supabase } from "@/lib/supabase"
import { LeaderboardSection } from "./leaderboard-section"
import { MatchHistorySection } from "./match-history-section"
import { ProfileSection } from "./profile-section"
import { AdminPanelSimple } from "./admin-panel-simple"
import { CelebrationEffects } from "./celebration-effects"
import { AchievementToast } from "./achievement-toast"
import { LoginScreen } from "./login-screen"
import { useAuth } from "./auth-provider"
import { AdminTournamentCreator } from "./admin-tournament-creator"
import { useToast } from "@/hooks/use-toast"
import { useHaptic } from "@/hooks/use-haptic"
import {
  Home,
  Trophy,
  Wallet,
  BarChart3,
  History,
  User,
  Shield,
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
  const { user, loading, isAdmin } = useAuth()
  const { toast } = useToast()
  const { triggerHaptic } = useHaptic()
  
  // All hooks must be declared before any conditional returns
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
  const [walletBalance, setWalletBalance] = useState(2450) // Default value, will be updated when user loads

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
  const [lastCardClick, setLastCardClick] = useState<{ cardType: string; timestamp: number } | null>(null)
  const [cardClickCount, setCardClickCount] = useState<{ [key: string]: number }>({})
  // Dynamic tournaments list
  const [tournaments, setTournaments] = useState<any[]>([])
  const [tournamentsLoading, setTournamentsLoading] = useState(false)
  const [tournamentsError, setTournamentsError] = useState<string | null>(null)

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

  // Store the selected tournament ID for viewing waiting room
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | undefined>(undefined)

  const [tournamentFlow, setTournamentFlow] = useState<{
    currentView: "dashboard" | "tournament-page" | "waiting-room"
    selectedGame?: string
    selectedSlot?: string
    selectedTournamentId?: string
  }>({
    currentView: "dashboard",
  })

  const [showAdminTournamentCreator, setShowAdminTournamentCreator] = useState(false)
  const fetchTournaments = useCallback(async () => {
    setTournamentsLoading(true)
    setTournamentsError(null)
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name, game, entry_fee, prize_pool, max_players, current_players, status, start_time, room_id, room_password, image_url, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      setTournaments(data || [])
    } catch (err: any) {
      console.error('[Dashboard] Failed to fetch tournaments:', err)
      setTournamentsError(err?.message || 'Failed to load tournaments')
    } finally {
      setTournamentsLoading(false)
    }
  }, [])
  useEffect(() => { fetchTournaments() }, [fetchTournaments])

  // Fetch user's joined tournaments
  const fetchJoinedTournaments = useCallback(async () => {
    if (!user) return

    try {
      console.log('🔍 Fetching joined tournaments for user:', user.id)
      
      const { data, error } = await supabase
        .from('tournament_participants')
        .select(`
          tournament_id,
          joined_at,
          tournaments (
            id,
            name,
            game,
            entry_fee,
            status,
            room_id,
            room_password
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('❌ Error fetching joined tournaments:', error)
        return
      }

      console.log('📊 Raw joined tournaments data:', data)

      const joinedTournamentsData = data?.map(participant => {
        const tournament = Array.isArray(participant?.tournaments) ? participant.tournaments[0] : participant?.tournaments
        if (!tournament || typeof tournament !== 'object') {
          console.warn('⚠️ Invalid tournament data:', participant)
          return null
        }
        
        return {
          id: tournament.id,
          name: tournament.name || 'Unknown Tournament',
          game: tournament.game || 'Unknown Game',
          entryFee: tournament.entry_fee || 0,
          joinedAt: new Date(participant.joined_at),
          status: "waiting" as const,
          roomId: tournament.room_id,
          password: tournament.room_password
        }
      }).filter((item): item is NonNullable<typeof item> => item !== null) || [] // Remove null entries with proper typing

      setJoinedTournaments(joinedTournamentsData)
      console.log('✅ Loaded joined tournaments:', joinedTournamentsData.length)

    } catch (error) {
      console.error('💥 Error fetching joined tournaments:', error)
      // Set empty array on error to prevent crashes
      setJoinedTournaments([])
    }
  }, [user])

  useEffect(() => { 
    fetchJoinedTournaments() 
  }, [fetchJoinedTournaments])

  const triggerAchievement = (achievement: Achievement) => {
    setCurrentAchievement(achievement)
    setCelebrationTrigger({ active: true, type: "achievement" })
    triggerHaptic("victory")
  }

  // Double tap detection for extra rewards
  const handleCardDoubleClick = useCallback((cardType: string) => {
    const now = Date.now()
    if (lastCardClick && lastCardClick.cardType === cardType && now - lastCardClick.timestamp < 500) {
      // Double tap detected!
      triggerHaptic("victory")
      setCardClickCount(prev => ({ ...prev, [cardType]: (prev[cardType] || 0) + 1 }))
      
      if ((cardClickCount[cardType] || 0) >= 4) {
        triggerAchievement({
          id: `card-master-${cardType}`,
          title: "Card Master!",
          description: `You've clicked the ${cardType} card 5 times! Such dedication! 🎯`,
          type: "special",
          icon: "star",
          rarity: "legendary"
        })
        setCelebrationTrigger({ active: true, type: "achievement" })
      }
      
      toast({
        title: "🔥 Double Tap!",
        description: "Nice reflexes! Keep tapping for surprises! ⚡",
        variant: "default",
      })
    }
    setLastCardClick({ cardType, timestamp: now })
  }, [lastCardClick, cardClickCount, triggerHaptic, toast])

  // Update wallet balance when user data loads
  useEffect(() => {
    if (user && user.wallet_balance !== undefined) {
      setWalletBalance(user.wallet_balance)
    }
  }, [user])

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login screen if user is not authenticated
  if (!user) {
    return <LoginScreen />
  }

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleNavClick = (navItem: string) => {
    triggerHaptic("button")
    setActiveNav(navItem)
    setIsMobileMenuOpen(false)
    
    // Reset tournament flow when changing navigation
    if (navItem !== "Tournament Waiting Room") {
      setTournamentFlow({ currentView: "dashboard" })
      setSelectedTournamentId(undefined)
    }
  }

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications)
  }

  const handleAddMoney = () => {
    triggerHaptic("medium")
    setPaymentModal({
      isOpen: true,
      type: "wallet",
    })
  }

  const handlePaymentClose = () => {
    setPaymentModal({
      isOpen: false,
      type: "wallet",
    })
    setPaymentStatus({ status: "idle", message: "" })
  }

  const handlePaymentSuccess = (amount: number) => {
    triggerHaptic("success")
    setWalletBalance((prev) => prev + amount)
    setCelebrationTrigger({ active: true, type: "money" })
    
    // Create a notification
    const paymentNotification: Notification = {
      id: `notif-${Date.now()}`,
      type: "payment_success",
      title: "Wallet Recharged!",
      message: `Successfully added ₹${amount} to your wallet`,
      timestamp: new Date(),
      read: false,
    }
    setNotifications((prev) => [paymentNotification, ...prev])
    
    toast({
      title: "💰 Payment Successful!",
      description: `Added ₹${amount} to your wallet!`,
      variant: "default",
    })
  }

  const handleCreateTournament = () => {
    triggerHaptic("medium")
    setShowAdminTournamentCreator(true)
  }

  const handleTournamentCreated = (tournament: any) => {
    triggerHaptic("success")
    setShowAdminTournamentCreator(false)
    
    // Add the new tournament to the list
    setTournaments((prev) => [tournament, ...prev])
    
    toast({
      title: "Tournament Created!",
      description: `Successfully created ${tournament.name}!`,
      variant: "default",
    })
  }

  const handleBackToTournaments = () => {
    triggerHaptic("button")
    setTournamentFlow({ currentView: "dashboard" })
    setSelectedTournamentId(undefined)
  }

  const handleLeaveTournament = (tournamentId: string) => {
    triggerHaptic("medium")
    
    // Remove from joined tournaments
    setJoinedTournaments((prev) => prev.filter((t) => t.id !== tournamentId))
    
    toast({
      title: "Left Tournament",
      description: "You have left the tournament",
      variant: "default",
    })
    
    // Go back to tournaments
    setTournamentFlow({ currentView: "dashboard" })
    setSelectedTournamentId(undefined)
  }

  // When a user clicks on "View Waiting Room" in My Tournaments
  const handleViewWaitingRoom = (tournamentId: string) => {
    console.log('View Waiting Room clicked for tournament:', tournamentId)
    triggerHaptic("button")
    
    // Update selected tournament ID
    setSelectedTournamentId(tournamentId)
    
    // Change active nav to Tournament Waiting Room
    setActiveNav("Tournament Waiting Room")
    
    toast({
      title: "Loading Waiting Room",
      description: "Opening tournament waiting room...",
      variant: "default",
    })
  }

  const renderContent = () => {
    // If viewing waiting room
    if (activeNav === "Tournament Waiting Room" && selectedTournamentId) {
      console.log('Rendering Tournament Waiting Room for:', selectedTournamentId)
      return (
        <TournamentWaitingRoomSimple
          tournamentId={selectedTournamentId}
          onBack={() => {
            setActiveNav("My Tournaments")
            setSelectedTournamentId(undefined)
          }}
        />
      )
    }
    
    switch (activeNav) {
      case "Dashboard":
        return (
          <div>
            <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card 
                className="bg-slate-800 border-slate-700 p-4 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handleCardDoubleClick("stats")}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Total Wins</p>
                    <p className="text-2xl font-bold text-white">{totalWins}</p>
                  </div>
                </div>
              </Card>
              
              <Card 
                className="bg-slate-800 border-slate-700 p-4 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handleCardDoubleClick("wallet")}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Balance</p>
                    <p className="text-2xl font-bold text-white">₹{walletBalance}</p>
                  </div>
                </div>
              </Card>
              
              <Card 
                className="bg-slate-800 border-slate-700 p-4 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handleCardDoubleClick("streak")}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <Flame className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Win Streak</p>
                    <p className="text-2xl font-bold text-white">{winStreak}</p>
                  </div>
                </div>
              </Card>
              
              <Card 
                className="bg-slate-800 border-slate-700 p-4 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handleCardDoubleClick("tournaments")}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Tournaments</p>
                    <p className="text-2xl font-bold text-white">{joinedTournaments.length}</p>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Recently joined tournaments */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">My Tournaments</h2>
                <Button variant="outline" size="sm" onClick={() => handleNavClick("My Tournaments")}>
                  View All
                </Button>
              </div>
              
              {joinedTournaments.length === 0 ? (
                <Card className="bg-slate-800 border-slate-700 p-6 text-center">
                  <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">No Tournaments Joined</h3>
                  <p className="text-slate-400 mb-4">You haven't joined any tournaments yet. Browse tournaments to get started!</p>
                  <Button onClick={() => handleNavClick("Tournaments")}>Browse Tournaments</Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {joinedTournaments.slice(0, 3).map((tournament) => (
                    <Card key={tournament.id} className="bg-slate-800 border-slate-700 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
                        <Badge className="bg-blue-500 text-white">{tournament.status}</Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{tournament.game}</p>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-slate-400">Entry Fee:</span>
                        <span className="text-white font-medium">₹{tournament.entryFee}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-4">
                        <span className="text-slate-400">Joined:</span>
                        <span className="text-white font-medium">{tournament.joinedAt.toLocaleDateString()}</span>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => handleViewWaitingRoom(tournament.id)}
                      >
                        {tournament.status === "live" ? "Join Match" : "View Waiting Room"}
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            {/* Popular tournaments */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Popular Tournaments</h2>
                <Button variant="outline" size="sm" onClick={() => handleNavClick("Tournaments")}>
                  View All
                </Button>
              </div>
              
              {/* Display popular tournaments from database */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tournamentsLoading ? (
                  // Loading state
                  Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="bg-slate-800 border-slate-700 animate-pulse">
                      <div className="h-32 bg-slate-700"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-6 bg-slate-700 rounded"></div>
                        <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                        <div className="h-10 bg-slate-700 rounded"></div>
                      </div>
                    </Card>
                  ))
                ) : (
                  tournaments.slice(0, 3).map((tournament) => (
                    <Card key={tournament.id} className="bg-slate-800 border-slate-700 overflow-hidden">
                      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <Trophy className="w-10 h-10 text-white" />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
                          <Badge className={`
                            ${tournament.status === 'live' ? 'bg-red-500' : 
                              tournament.status === 'upcoming' ? 'bg-green-500' : 'bg-slate-500'} 
                            text-white
                          `}>
                            {tournament.status === 'live' ? 'LIVE' : tournament.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{tournament.game}</p>
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-slate-400">Prize Pool:</span>
                          <span className="text-white font-medium">₹{tournament.prize_pool}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                          <span className="text-slate-400">Players:</span>
                          <span className="text-white font-medium">{tournament.current_players}/{tournament.max_players}</span>
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => {
                            if (tournament.status === 'upcoming' || tournament.status === 'active') {
                              // Logic to join tournament
                              const joinTournament = async () => {
                                // Check if already joined
                                const { data, error } = await supabase
                                  .from('tournament_participants')
                                  .select('id')
                                  .eq('tournament_id', tournament.id)
                                  .eq('user_id', user.id)
                                  .single()
                                
                                if (data) {
                                  // Already joined, go to waiting room
                                  handleViewWaitingRoom(tournament.id)
                                  return
                                }
                                
                                // Join logic here
                                // This is simplified; in real app you'd have payment checks etc.
                                const { error: joinError } = await supabase
                                  .from('tournament_participants')
                                  .insert({
                                    tournament_id: tournament.id,
                                    user_id: user.id
                                  })
                                
                                if (joinError) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to join tournament",
                                    variant: "destructive"
                                  })
                                  return
                                }
                                
                                toast({
                                  title: "Success",
                                  description: "You have joined the tournament!",
                                  variant: "default"
                                })
                                
                                // Refresh tournaments
                                fetchJoinedTournaments()
                                
                                // Go to waiting room
                                handleViewWaitingRoom(tournament.id)
                              }
                              
                              joinTournament()
                            } else if (tournament.status === 'live') {
                              // Go directly to waiting room for live tournaments
                              handleViewWaitingRoom(tournament.id)
                            }
                          }}
                        >
                          {tournament.status === 'live' ? 'Join Now' : 'Join Tournament'}
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      
      case "Tournaments":
        return <TournamentsSection onJoinTournament={handleViewWaitingRoom} />
      
      case "My Tournaments":
        return <MyTournaments user={user} onViewWaitingRoom={handleViewWaitingRoom} onBrowseTournaments={() => handleNavClick("Tournaments")} />
      
      case "Wallet":
        return <WalletSection onAddMoney={handleAddMoney} />
      
      case "Leaderboard":
        return <LeaderboardSection />
      
      case "Match History":
        return <MatchHistorySection />
      
      case "Profile":
        return <ProfileSection />
      
      case "Admin Panel":
        return <AdminPanelSimple onCreateTournament={handleCreateTournament} />
      
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
            <p className="text-slate-400 mb-6">The page you're looking for doesn't exist or has been moved.</p>
            <Button onClick={() => handleNavClick("Dashboard")}>Go to Dashboard</Button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <CelebrationEffects
        trigger={celebrationTrigger.active}
        type={celebrationTrigger.type}
        onComplete={() => setCelebrationTrigger({ active: false, type: "victory" })}
      />

      <AchievementToast achievement={currentAchievement} onClose={() => setCurrentAchievement(null)} />

      <header className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="lg:hidden p-2" onClick={toggleMobileMenu}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold">GameArena Pro</h1>
              <p className="text-xs text-slate-400">Elite Tournament Platform</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48 lg:w-64 bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <Button variant="ghost" size="sm" className="md:hidden p-2">
            <Search className="w-4 h-4" />
          </Button>

          <div className="relative">
            <Button variant="ghost" size="sm" className="p-2 relative" onClick={handleNotificationClick}>
              <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
              {notifications.filter((n) => !n.read).length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No notifications yet</div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-700 ${
                          !notification.read ? "bg-slate-700/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === "tournament_joined"
                                ? "bg-blue-500"
                                : notification.type === "tournament_won"
                                  ? "bg-green-500"
                                  : notification.type === "payment_success"
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                            }`}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <p className="text-slate-400 text-xs mt-1">{notification.message}</p>
                            <p className="text-slate-400 text-xs mt-2">
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

          <div className="flex items-center gap-1 bg-slate-700 border border-blue-500/30 px-2 py-1 rounded-lg">
            <Wallet className="w-3 h-3 text-blue-400" />
            <span className="font-bold text-sm">
              ₹{walletBalance.toLocaleString()}
            </span>
          </div>
          <Button
            onClick={handleAddMoney}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white"
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
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
          <div className="flex items-center justify-between p-4 lg:hidden">
            <span className="font-semibold">{activeNav}</span>
            <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="p-4 space-y-2">
            {[
              { name: "Dashboard", icon: Home },
              { name: "Tournaments", icon: Trophy },
              { name: "My Tournaments", icon: Star },
              { name: "Wallet", icon: Wallet },
              { name: "Leaderboard", icon: BarChart3 },
              { name: "Match History", icon: History },
              { name: "Profile", icon: User },
              { name: "Tournament Waiting Room", icon: Clock, show: !!selectedTournamentId },
              { name: "Admin Panel", icon: Shield, show: isAdmin },
            ]
            .filter(item => item.show !== false)
            .map((item) => {
              const Icon = item.icon
              const isActive = activeNav === item.name
              return (
                <div
                  key={item.name}
                  onClick={() => handleNavClick(item.name)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer ${
                    isActive
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "text-slate-400 hover:bg-slate-700 hover:text-white"
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
        <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 p-3 rounded-lg hover:border-blue-500/30 transition-colors cursor-pointer lg:w-auto backdrop-blur-sm">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar_url || "/placeholder-d8fkw.png"} alt={`${user.full_name} profile picture`} />
            <AvatarFallback>{user.full_name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm lg:text-base">{user.full_name}</p>
            <p className="text-blue-400 text-xs lg:text-sm font-medium">Elite Player</p>
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
      {showAdminTournamentCreator && (
        <AdminTournamentCreator
          onClose={() => setShowAdminTournamentCreator(false)}
          onTournamentCreated={handleTournamentCreated}
        />
      )}
    </div>
  )
}