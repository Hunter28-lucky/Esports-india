"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PaymentPortal } from "./payment-portal"
import { TournamentPage } from "./tournament-page"
import { TournamentWaitingRoom } from "./tournament-waiting-room-new"
import MyTournaments from "./my-tournaments-clean"
import { WalletSection } from "./wallet-section"
import { TournamentsSection } from "./tournaments-section"
import { supabase } from "@/lib/supabase"
import { LeaderboardSection } from "./leaderboard-section"
import { MatchHistorySection } from "./match-history-section"
import { ProfileSection } from "./profile-section"
import { AdminPanel } from "./admin-panel"
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
    console.log('[Dashboard] Fetching tournaments...')
    setTournamentsLoading(true)
    setTournamentsError(null)

    // Client-side fetch to our server API with a timeout
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 10000)

    try {
      const res = await fetch('/api/tournaments', { signal: controller.signal, cache: 'no-store' })
      clearTimeout(id)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Failed to load tournaments (status ${res.status})`)
      }
      const body = await res.json()
      const list = Array.isArray(body?.tournaments) ? body.tournaments : []
      console.log('[Dashboard] Tournaments fetch result:', { count: list.length })
      setTournaments(list)
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.warn('[Dashboard] Tournaments fetch timed out')
        setTournamentsError('Request timed out. Please try again.')
      } else {
        console.error('[Dashboard] Failed to fetch tournaments:', err)
        setTournamentsError(err?.message || 'Failed to load tournaments')
      }
      setTournaments([])
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
        .eq('tournaments.status', 'active') // Only get active tournaments

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
  }, [lastCardClick, cardClickCount, triggerHaptic, triggerAchievement, toast])

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

  const handleNavClick = (navItem: string) => {
    triggerHaptic("button")
    setActiveNav(navItem)
    setIsMobileMenuOpen(false)
    setTournamentFlow({ currentView: "dashboard" })
    if (navItem === 'Tournaments') {
      // Proactively fetch tournaments when navigating to the tab
      fetchTournaments()
    }
  }

  const handleJoinTournament = async (tournamentName: string, entryFee: number) => {
    triggerHaptic("medium")

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join tournaments",
        variant: "destructive",
      })
      return
    }

    // For dashboard tournament cards, find and join the real tournament from database
    try {
      const { data: tournaments, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('name', tournamentName)
        .eq('status', 'upcoming')
        .single()

      if (error || !tournaments) {
        console.error('Tournament not found:', error)
        toast({
          title: "Tournament Not Found",
          description: "This tournament is no longer available",
          variant: "destructive",
        })
        return
      }

      // Check if user has sufficient balance
      if (walletBalance < tournaments.entry_fee) {
        triggerHaptic("error")
        setPaymentModal({
          isOpen: true,
          type: "wallet",
        })
        return
      }

      // Join the tournament in the database
      const { error: joinError } = await supabase
        .from('tournament_participants')
        .insert([{
          tournament_id: tournaments.id,
          user_id: user.id
        }])

      if (joinError) {
        console.error('Error joining tournament:', joinError)
        toast({
          title: "Join Failed",
          description: "Failed to join tournament. You may already be registered.",
          variant: "destructive",
        })
        return
      }

      // Update tournament current_players count
      await supabase
        .from('tournaments')
        .update({ current_players: tournaments.current_players + 1 })
        .eq('id', tournaments.id)

      // Deduct entry fee and create transaction
      setWalletBalance(prev => prev - tournaments.entry_fee)
      
      await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'tournament_entry',
          amount: -tournaments.entry_fee,
          description: `Joined ${tournaments.name}`
        }])

      // Show success notification with personalized message
      const userName = user.full_name || user.email?.split('@')[0] || "Player"
      const joinNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: "tournament_joined",
        title: "Tournament Joined!",
        message: `${userName} joined ${tournaments.game} tournament`,
        timestamp: new Date(),
        read: false,
      }
      setNotifications((prev) => [joinNotification, ...prev])

      toast({
        title: "🎉 Tournament Joined Successfully!",
        description: `${userName} joined ${tournaments.name}! Good luck! 🔥`,
        variant: "default",
      })

      // Navigate to tournament page
      const gameMap: { [key: string]: string } = {
        "Free Fire Championship": "Free Fire",
        "PUBG Mobile Pro": "PUBG Mobile", 
        "Valorant Masters": "Valorant",
      }

      const game = gameMap[tournamentName] || tournaments.game
      setTournamentFlow({
        currentView: "tournament-page",
        selectedGame: game,
      })

    } catch (error) {
      console.error('Unexpected error joining tournament:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while joining the tournament",
        variant: "destructive",
      })
    }
  }

  // Handle joining tournaments from the tournaments section
  const handleJoinTournamentById = async (tournamentId: string, tournamentName: string, entryFee: number) => {
    triggerHaptic("medium")

    console.log('🎯 Attempting to join tournament:', { tournamentId, tournamentName, entryFee, user: user?.id })

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join tournaments",
        variant: "destructive",
      })
      return
    }

    // Check if user has sufficient balance
    if (walletBalance < entryFee) {
      triggerHaptic("error")
      setPaymentModal({
        isOpen: true,
        type: "wallet",
      })
      return
    }

    try {
      // First check if user is already registered
      console.log('🔍 Checking if user is already registered...')
      const { data: existingParticipant, error: checkError } = await supabase
        .from('tournament_participants')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error checking existing participation:', checkError)
        toast({
          title: "Database Error",
          description: `Failed to verify registration status: ${checkError.message}`,
          variant: "destructive",
        })
        return
      }

      if (existingParticipant) {
        console.warn('⚠️ User already registered for tournament')
        toast({
          title: "Already Registered",
          description: "You are already registered for this tournament!",
          variant: "destructive",
        })
        return
      }

      // Check tournament capacity
      console.log('🏟️ Checking tournament capacity...')
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select('current_players, max_players, status, name, game, room_id, room_password')
        .eq('id', tournamentId)
        .single()

      if (tournamentError) {
        console.error('❌ Error fetching tournament:', tournamentError)
        toast({
          title: "Tournament Error",
          description: `Failed to load tournament details: ${tournamentError.message}`,
          variant: "destructive",
        })
        return
      }

      if (tournament.current_players >= tournament.max_players) {
        console.warn('⚠️ Tournament is full')
        toast({
          title: "Tournament Full",
          description: "This tournament has reached maximum capacity",
          variant: "destructive",
        })
        return
      }

      if (tournament.status === 'completed') {
        console.warn('⚠️ Tournament is completed')
        toast({
          title: "Tournament Completed",
          description: "This tournament has already ended",
          variant: "destructive",
        })
        return
      }

      // Join the tournament in the database
      console.log('📝 Inserting tournament participation...')
      const { error: joinError } = await supabase
        .from('tournament_participants')
        .insert([{
          tournament_id: tournamentId,
          user_id: user.id
        }])

      if (joinError) {
        console.error('❌ Error joining tournament:', joinError)
        
        if (joinError.message.includes('duplicate key')) {
          toast({
            title: "Already Registered",
            description: "You are already registered for this tournament!",
            variant: "destructive",
          })
        } else if (joinError.message.includes('foreign key')) {
          toast({
            title: "Invalid Tournament",
            description: "Tournament not found or user profile incomplete",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Join Failed",
            description: `Database error: ${joinError.message}`,
            variant: "destructive",
          })
        }
        return
      }

      // Update tournament current_players count
      console.log('📊 Updating tournament player count...')
      const { error: updateError } = await supabase
        .from('tournaments')
        .update({ current_players: tournament.current_players + 1 })
        .eq('id', tournamentId)

      if (updateError) {
        console.error('⚠️ Error updating player count:', updateError)
        // Don't fail the join for this, just log it
      }

      // Deduct entry fee and create transaction
      console.log('💰 Processing payment and creating transaction...')
      setWalletBalance(prev => prev - entryFee)
      
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'tournament_entry',
          amount: -entryFee,
          description: `Joined ${tournamentName}`
        }])

      if (transactionError) {
        console.error('⚠️ Error creating transaction:', transactionError)
        // Don't fail the join for this, just log it
      }

      // Show success notification with personalized message
      const userName = user.full_name || user.email?.split('@')[0] || "Player"
      const joinNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: "tournament_joined",
        title: "Tournament Joined!",
        message: `${userName} joined ${tournamentName}`,
        timestamp: new Date(),
        read: false,
      }
      setNotifications((prev) => [joinNotification, ...prev])

      console.log('✅ Successfully joined tournament!')
      toast({
        title: "🎉 Tournament Joined Successfully!",
        description: `${userName} joined ${tournamentName}! Good luck! 🔥`,
        variant: "default",
      })

      // Add to joined tournaments and redirect to waiting room
      const joinedTournament = {
        id: tournamentId,
        name: tournamentName,
        game: tournament?.game || "Unknown Game",
        entryFee: entryFee,
        joinedAt: new Date(),
        status: "waiting" as const,
        roomId: tournament?.room_id || undefined,
        password: tournament?.room_password || undefined
      }

      setJoinedTournaments(prev => [...prev, joinedTournament])
      
      // Navigate to waiting room
      setActiveNav("Tournament Waiting Room")
      setTournamentFlow({
        currentView: "waiting-room",
        selectedTournamentId: tournamentId
      })

      console.log('🚀 Redirecting to tournament waiting room...')

      // Refresh tournaments list
      fetchTournaments()

      setCelebrationTrigger({ active: true, type: "victory" })

    } catch (error) {
      console.error('💥 Unexpected error joining tournament:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      toast({
        title: "Unexpected Error",
        description: `Something went wrong: ${errorMessage}`,
        variant: "destructive",
      })
    }
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
      const gameName = tournamentFlow.selectedGame || "Free Fire"
      const newTournament = {
        id: `tournament-${Date.now()}`,
        name: `${gameName} Championship`,
        game: gameName,
        entryFee,
        joinedAt: new Date(),
        status: "waiting" as const,
      }
      setJoinedTournaments((prev) => [...prev, newTournament])

      // Create personalized join notification
      const userName = user?.full_name || user?.email?.split('@')[0] || "Player"
      const joinNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: "tournament_joined",
        title: "Tournament Joined!",
        message: `${userName} joined ${gameName} tournament`,
        timestamp: new Date(),
        read: false,
      }
      setNotifications((prev) => [joinNotification, ...prev])

      toast({
        title: "🎉 Tournament Joined Successfully!",
        description: `${userName} joined ${gameName} tournament! Get ready to play! 🔥`,
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

      // Navigate to waiting room (proper tournament management)
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

  const handleLeaveTournament = async () => {
    const shouldLeave = confirm("Are you sure you want to leave this tournament? Your entry fee will not be refunded.")
    if (!shouldLeave || !user) return

    triggerHaptic("warning")

    try {
      // If we have joined tournaments from the waiting room, remove the most recent one
      if (joinedTournaments.length > 0) {
        const tournamentToLeave = joinedTournaments[0] // Assuming we're viewing the first one
        
        // Remove from database
        const { error: deleteError } = await supabase
          .from('tournament_participants')
          .delete()
          .eq('tournament_id', tournamentToLeave.id)
          .eq('user_id', user.id)

        if (deleteError) {
          console.error('Error leaving tournament:', deleteError)
          toast({
            title: "Error",
            description: "Failed to leave tournament. Please try again.",
            variant: "destructive",
          })
          return
        }

        // Update tournament current_players count
        const { data: tournament } = await supabase
          .from('tournaments')
          .select('current_players')
          .eq('id', tournamentToLeave.id)
          .single()

        if (tournament) {
          await supabase
            .from('tournaments')
            .update({ current_players: Math.max(0, tournament.current_players - 1) })
            .eq('id', tournamentToLeave.id)
        }

        // Remove from local state
        setJoinedTournaments(prev => prev.filter(t => t.id !== tournamentToLeave.id))

        toast({
          title: "Left Tournament",
          description: `You have left ${tournamentToLeave.name}`,
          variant: "default",
        })
      }

      // Navigate back to tournaments
      setActiveNav("Tournaments")
      setTournamentFlow({ currentView: "dashboard" })

    } catch (error) {
      console.error('Error leaving tournament:', error)
      toast({
        title: "Error",
        description: "Failed to leave tournament. Please try again.",
        variant: "destructive",
      })
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
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can create tournaments",
        variant: "destructive"
      })
      return
    }
    triggerHaptic("medium")
    setShowAdminTournamentCreator(true)
  }

  const handleTournamentCreated = () => {
    toast({
      title: "🎉 Tournament Created Successfully!",
      description: "The new tournament is now live and players can join",
      variant: "default"
    })
    fetchTournaments()
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-slate-300 text-sm">
                {tournamentsLoading ? 'Loading tournaments…' : `Tournaments: ${tournaments.length}`}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-200 hover:bg-slate-800"
                onClick={() => fetchTournaments()}
                disabled={tournamentsLoading}
              >
                {tournamentsLoading ? 'Refreshing…' : 'Refresh'}
              </Button>
            </div>
            {tournamentsLoading && (
              <div className="p-4 border border-primary/30 rounded-md text-primary text-sm animate-pulse">Loading tournaments...</div>
            )}
            {tournamentsError && (
              <div className="p-4 border border-red-500/30 rounded-md text-red-400 text-sm">{tournamentsError}</div>
            )}
            <TournamentsSection
              onJoinTournament={handleJoinTournamentById}
              onCreateTournament={handleCreateTournament}
              isAdmin={isAdmin}
              tournaments={tournaments}
            />
          </div>
        )
      case "My Tournaments":
        return (
          <MyTournaments
            user={user}
            onViewWaitingRoom={(tournamentId) => {
              setTournamentFlow({
                currentView: "waiting-room",
                selectedTournamentId: tournamentId
              })
              setActiveNav("Tournament Waiting Room")
            }}
          />
        )
      case "Leaderboard":
        return <LeaderboardSection />
      case "Match History":
        return <MatchHistorySection />
      case "Profile":
        return <ProfileSection user={user} />
      case "Tournament Waiting Room":
        try {
          return (
            <TournamentWaitingRoom
              joinedTournaments={joinedTournaments}
              selectedTournamentId={tournamentFlow.selectedTournamentId}
              onBack={() => setActiveNav("Tournaments")}
              onLeaveTournament={handleLeaveTournament}
              user={user}
            />
          )
        } catch (error) {
          console.error('Error rendering Tournament Waiting Room:', error)
          return (
            <div className="min-h-screen bg-black text-white p-4">
              <div className="max-w-4xl mx-auto text-center py-12">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Tournament Waiting Room Error</h2>
                <p className="text-slate-400 mb-4">There was an issue loading the waiting room.</p>
                <Button onClick={() => setActiveNav("Tournaments")} className="bg-blue-600 hover:bg-blue-700">
                  Back to Tournaments
                </Button>
              </div>
            </div>
          )
        }
      case "Admin Panel":
        return <AdminPanel onCreateTournament={handleCreateTournament} />
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

            {/* Main Dashboard Content */}
            <div className="space-y-8"
              onDoubleClick={(e) => {
                const target = e.target as HTMLElement
                const cardType = target.closest('[data-card-type]')?.getAttribute('data-card-type')
                if (cardType) {
                  handleCardDoubleClick(cardType)
                }
              }}
            >

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
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8 px-2 sm:px-0" aria-label="Player Statistics">
              <Card 
                className="bg-card border-primary/30 p-4 sm:p-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group gradient-border-red card-hover min-h-[120px] sm:min-h-[140px] cursor-pointer select-none"
                onMouseEnter={() => triggerHaptic("light")}
                onClick={() => {
                  triggerHaptic("medium")
                  handleCardDoubleClick("tournaments")
                  setCelebrationTrigger({ active: true, type: "victory" })
                }}
              >
                <div className="relative z-10 h-full">
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                    <p className="text-muted-foreground text-xs sm:text-sm font-medium">TOURNAMENTS</p>
                    <div className="flex items-center gap-3">
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{user.total_tournaments}</p>
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-colors animate-victory-bounce">
                        <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400 font-medium animate-pulse">+12% this week</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="bg-card border-border p-4 sm:p-6 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 group card-hover min-h-[120px] sm:min-h-[140px] cursor-pointer select-none"
                onMouseEnter={() => triggerHaptic("light")}
                onClick={() => {
                  triggerHaptic("medium")
                  handleCardDoubleClick("winrate")
                  toast({
                    title: "🏆 Elite Performance!",
                    description: "You're crushing the competition! Keep it up! 🔥",
                    variant: "default",
                  })
                }}
              >
                <div className="relative z-10 h-full">
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                    <p className="text-muted-foreground text-xs sm:text-sm font-medium">WIN RATE</p>
                    <div className="flex items-center gap-3">
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">
                        {user.total_tournaments > 0 ? Math.round((user.total_wins / user.total_tournaments) * 100) : 0}%
                      </p>
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                        <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-red-400" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 text-red-400" />
                      <span className="text-xs text-red-400 font-medium">Elite tier</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="bg-card border-border p-4 sm:p-6 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 group card-hover min-h-[120px] sm:min-h-[140px] cursor-pointer select-none"
                onMouseEnter={() => triggerHaptic("light")}
                onClick={() => {
                  triggerHaptic("heavy")
                  handleCardDoubleClick("kills")
                  triggerAchievement({
                    id: "sharpshooter",
                    title: "Sharpshooter Master",
                    description: `Incredible aim! ${user.total_kills} total kills!`,
                    type: "milestone",
                    icon: "target",
                    rarity: "epic"
                  })
                }}
              >
                <div className="relative z-10 h-full">
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                    <p className="text-muted-foreground text-xs sm:text-sm font-medium">TOTAL KILLS</p>
                    <div className="flex items-center gap-3">
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{user.total_kills}</p>
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                        <Target className="w-4 h-4 sm:w-6 sm:h-6 text-orange-400" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Zap className="w-3 h-3 text-orange-400" />
                      <span className="text-xs text-orange-400 font-medium">Sharpshooter</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="bg-card border-primary/30 p-4 sm:p-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group gradient-border-gold card-hover-gold min-h-[120px] sm:min-h-[140px] cursor-pointer select-none"
                onMouseEnter={() => triggerHaptic("light")}
                onClick={() => {
                  triggerHaptic("success")
                  handleCardDoubleClick("winnings")
                  setCelebrationTrigger({ active: true, type: "money" })
                  toast({
                    title: "💰 Money Machine!",
                    description: `₹${user.total_winnings.toLocaleString()} earned! You're on fire! 🚀💸`,
                    variant: "default",
                  })
                }}
              >
                <div className="relative z-10 h-full">
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                    <p className="text-muted-foreground text-xs sm:text-sm font-medium">TOTAL WINNINGS</p>
                    <div className="flex items-center gap-3">
                      <p className="text-2xl sm:text-3xl font-bold text-foreground text-glow-gold">₹{user.total_winnings.toLocaleString()}</p>
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-colors animate-level-up">
                        <Gift className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400 font-medium animate-coin-flip">+₹2,450 today</span>
                    </div>
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
                  {isAdmin && (
                    <Button
                      onClick={handleCreateTournament}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors flex-1 sm:flex-none font-bold animate-pulse-red"
                    >
                      <Plus className="w-4 h-4 sm:hidden" />
                      <span className="hidden sm:inline">CREATE TOURNAMENT</span>
                      <span className="sm:hidden">CREATE</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Tournament cards from database */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tournamentsLoading ? (
                  // Loading state
                  Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="bg-card border-border overflow-hidden animate-pulse">
                      <div className="h-48 bg-muted"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded"></div>
                        </div>
                        <div className="h-8 bg-muted rounded"></div>
                      </div>
                    </Card>
                  ))
                ) : tournamentsError ? (
                  // Error state
                  <div className="col-span-full">
                    <Card className="bg-red-500/10 border-red-500/20 p-6 text-center">
                      <p className="text-red-400 font-medium mb-2">Failed to load tournaments</p>
                      <p className="text-muted-foreground text-sm">{tournamentsError}</p>
                      <Button 
                        onClick={fetchTournaments}
                        variant="outline" 
                        size="sm" 
                        className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        Retry
                      </Button>
                    </Card>
                  </div>
                ) : tournaments.length === 0 ? (
                  // Empty state
                  <div className="col-span-full">
                    <Card className="bg-card border-border p-8 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Tournaments Available</h3>
                      <p className="text-muted-foreground mb-4">
                        Be the first to create an exciting tournament for the community!
                      </p>
                      {isAdmin && (
                        <Button 
                          onClick={handleCreateTournament}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Tournament
                        </Button>
                      )}
                    </Card>
                  </div>
                ) : (
                  // Display real tournaments from database
                  tournaments.slice(0, 6).map((tournament) => {
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case "live": return "bg-red-500"
                        case "upcoming": return "bg-green-500"
                        default: return "bg-yellow-500"
                      }
                    }

                    const getStatusText = (status: string) => {
                      switch (status) {
                        case "live": return "🔴 LIVE"
                        case "upcoming": return "✅ OPEN"
                        default: return "⏰ SOON"
                      }
                    }

                    const getGameIcon = (game: string) => {
                      if (game.toLowerCase().includes('free fire')) return <Zap className="w-4 h-4 text-orange-500" />
                      if (game.toLowerCase().includes('pubg')) return <Target className="w-4 h-4 text-blue-500" />
                      if (game.toLowerCase().includes('valorant')) return <Zap className="w-4 h-4 text-red-500" />
                      return <Trophy className="w-4 h-4 text-primary" />
                    }

                    const getDefaultImage = (game: string) => {
                      if (game.toLowerCase().includes('free fire')) return '/free-fire-championship-tournament-esports.jpg'
                      if (game.toLowerCase().includes('pubg')) return '/pubg-mobile-pro-tournament-esports.jpg' 
                      if (game.toLowerCase().includes('valorant')) return '/valorant-masters-tournament-esports.jpg'
                      return '/placeholder.jpg'
                    }

                    const timeUntilStart = new Date(tournament.start_time).getTime() - Date.now()
                    const startTimeText = timeUntilStart > 0 
                      ? `${Math.floor(timeUntilStart / (1000 * 60 * 60))}h ${Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60))}m`
                      : "LIVE"

                    return (
                      <article 
                        key={tournament.id} 
                        className="bg-card border-border overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group relative card-hover animate-slide-up"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>
                        
                        <div className="relative h-48">
                          <img
                            src={tournament.image_url || getDefaultImage(tournament.game)}
                            alt={`${tournament.name} - ${tournament.game} tournament`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              if (target.src !== getDefaultImage(tournament.game)) {
                                target.src = getDefaultImage(tournament.game)
                              } else {
                                target.src = "/placeholder.jpg"
                              }
                            }}
                          />
                          <Badge className={`absolute top-3 left-3 ${getStatusColor(tournament.status)} text-white border-0 text-xs font-bold`}>
                            {getStatusText(tournament.status)}
                          </Badge>
                          <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded text-xs text-white font-medium">
                            {tournament.current_players}/{tournament.max_players}
                          </div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2">
                              <div className="flex items-center gap-2 text-white text-xs">
                                <Clock className="w-3 h-3" />
                                <span>Starts in {startTimeText}</span>
                                <div className="ml-auto flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{tournament.current_players} joined</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {getGameIcon(tournament.game)}
                            <h3 className="font-bold text-foreground truncate">{tournament.name}</h3>
                            {tournament.status === 'live' && (
                              <Badge className="ml-auto text-xs bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                                HOT
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{tournament.game}</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Entry Fee:</span>
                              <span className="text-foreground font-medium">₹{tournament.entry_fee}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Prize Pool:</span>
                              <span className="text-primary font-bold">₹{tournament.prize_pool.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Players:</span>
                              <span className="text-foreground">{tournament.current_players}/{tournament.max_players}</span>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleJoinTournamentById(tournament.id, tournament.name, tournament.entry_fee)}
                            disabled={tournament.current_players >= tournament.max_players || tournament.status === 'completed'}
                            className={`w-full transition-all duration-300 font-bold ${
                              tournament.current_players >= tournament.max_players 
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary hover:bg-primary/90 text-primary-foreground"
                            }`}
                            size="sm"
                          >
                            {tournament.current_players >= tournament.max_players 
                              ? "TOURNAMENT FULL" 
                              : `JOIN BATTLE - ₹${tournament.entry_fee}`
                            }
                          </Button>
                        </div>

                        {/* Progress bar */}
                        <div className="px-4 pb-4">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-primary to-accent"
                              style={{ width: `${(tournament.current_players / tournament.max_players) * 100}%` }}
                            />
                          </div>
                        </div>
                      </article>
                    )
                  })
                )}
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
                        <AvatarImage src={user.avatar_url || "/placeholder-3t9qp.png"} alt={`${user.full_name} avatar`} />
                        <AvatarFallback>{user.full_name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-foreground font-medium">You ({user.full_name})</p>
                        <p className="text-muted-foreground text-xs">{user.total_kills} kills • {user.total_wins} wins</p>
                      </div>
                    </div>
                    <span className="text-primary font-bold text-glow">₹{user.total_winnings.toLocaleString()}</span>
                  </div>
                </div>
              </article>
            </section>
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
              <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-2xl z-[60] max-h-96 overflow-y-auto animate-slide-up ring-1 ring-primary/20">
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

      {showNotifications && <div className="fixed inset-0 z-[55]" onClick={() => setShowNotifications(false)} />}

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
              { name: "My Tournaments", icon: Star },
              { name: "Wallet", icon: Wallet },
              { name: "Leaderboard", icon: BarChart3 },
              { name: "Match History", icon: History },
              { name: "Profile", icon: User },
              ...(joinedTournaments.length > 0 ? [{ name: "Tournament Waiting Room", icon: Clock }] : []),
              ...(isAdmin ? [{ name: "Admin Panel", icon: Shield }] : []),
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
            <AvatarImage src={user.avatar_url || "/placeholder-d8fkw.png"} alt={`${user.full_name} profile picture`} />
            <AvatarFallback>{user.full_name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-foreground font-semibold text-sm lg:text-base">{user.full_name}</p>
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
      {showAdminTournamentCreator && (
        <AdminTournamentCreator
          onClose={() => setShowAdminTournamentCreator(false)}
          onTournamentCreated={handleTournamentCreated}
        />
      )}
    </div>
  )
}
