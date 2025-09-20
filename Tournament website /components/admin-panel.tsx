"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Edit, Users, Calendar, DollarSign, Shield, Crown, Settings, Trophy, Save } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"
// Dev-only diagnostics (kept out of prod bundle)
const AdminDebug = process.env.NODE_ENV !== 'production'
  ? dynamic(() => import('./admin-debug'), { ssr: false })
  : (() => null as any)
const DatabaseTestComponent = process.env.NODE_ENV !== 'production'
  ? dynamic(() => import('./database-test').then(m => m.DatabaseTestComponent), { ssr: false })
  : (() => null as any)
const AuthStatusComponent = process.env.NODE_ENV !== 'production'
  ? dynamic(() => import('./auth-status').then(m => m.AuthStatusComponent), { ssr: false })
  : (() => null as any)

interface Tournament {
  id: string
  name: string
  game: string
  entry_fee: number
  prize_pool: number
  max_players: number
  current_players: number
  status: string
  start_time: string
  image_url?: string
  room_id?: string
  room_password?: string
}

interface EditData {
  name?: string
  game?: string
  entry_fee?: string
  prize_pool?: string
  max_players?: string
  start_time?: string
  image_url?: string
  room_id?: string
  room_password?: string
  status?: string
}

interface AdminPanelProps {
  onCreateTournament: () => void
}

export function AdminPanel({ onCreateTournament }: AdminPanelProps) {
  const { toast } = useToast()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTournament, setEditingTournament] = useState<string | null>(null)
  const [editData, setEditData] = useState<EditData>({})
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalUsers: 0,
    totalRevenue: 0
  })
  const [statsLoading, setStatsLoading] = useState(false)
  const [hydratedFromCache, setHydratedFromCache] = useState(false)

  const CACHE_KEYS = {
    tournaments: 'ga:admin:tournaments:last',
    stats: 'ga:admin:stats:last',
  }

  const defaultImageForGame = (game?: string) => {
    const g = (game || '').toLowerCase()
    if (g.includes('pubg')) return '/pubg-mobile-pro-tournament-esports.jpg'
    if (g.includes('free fire')) return '/free-fire-championship-tournament-esports.jpg'
    if (g.includes('valorant')) return '/valorant-masters-tournament-esports.jpg'
    return '/placeholder.jpg'
  }

  const initializeData = async () => {
    console.log('[AdminPanel] Initializing and fetching data...')
    if (!hydratedFromCache) setLoading(true)
    setError(null)

    try {
      // Quick auth check first (helps RLS policy diagnostics)
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.warn('[AdminPanel] Auth check error:', authError)
      }
      if (!authData?.user) {
        setError('Please sign in to view admin data (RLS requires authenticated access).')
        setLoading(false)
        return
      }

      // Non-blocking quick connectivity test
      const ping = supabase.from('tournaments').select('id', { head: true, count: 'exact' }).limit(1)
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 2000))
      Promise.race([ping, timeout]).catch((e) => console.warn('[AdminPanel] ping failed (non-blocking):', e?.message || e))

      // Fetch tournaments first (primary UI), start stats in background for faster perceived load
      await fetchTournaments()
      fetchStats() // intentionally not awaited
      setError(null)
    } catch (e) {
      console.error('[AdminPanel] Initialization failed:', e)
      const message = e instanceof Error ? e.message : 'Unknown error'
      if (/timeout/i.test(message)) {
        setError('Connection timeout. Check network or Supabase availability and retry.')
      } else {
        setError(`Failed to load admin data: ${message}`)
      }
      setTournaments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Hydrate from cache for instant UI
    try {
      const t = localStorage.getItem(CACHE_KEYS.tournaments)
      const s = localStorage.getItem(CACHE_KEYS.stats)
      if (t) {
        const parsed = JSON.parse(t) as Tournament[]
        setTournaments(Array.isArray(parsed) ? parsed : [])
      }
      if (s) {
        const parsedStats = JSON.parse(s) as typeof stats
        if (parsedStats && typeof parsedStats === 'object') {
          setStats({
            totalTournaments: parsedStats.totalTournaments || 0,
            activeTournaments: parsedStats.activeTournaments || 0,
            totalUsers: parsedStats.totalUsers || 0,
            totalRevenue: parsedStats.totalRevenue || 0,
          })
        }
      }
      if (t || s) {
        setHydratedFromCache(true)
        setLoading(false)
      }
    } catch (e) {
      console.warn('[AdminPanel] Cache hydration failed:', e)
    }

    // Always refresh from network
    initializeData()
  }, [])

  const fetchTournaments = async () => {
    try {
      console.log('Starting fetchTournaments...')
      // Fetch minimal fields first; limit results to keep payload small
      console.log('Fetching tournaments (minimal fields)...')
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name, game, entry_fee, prize_pool, max_players, current_players, status, start_time, image_url, room_id, room_password, created_at')
  .order('created_at', { ascending: false })
  .limit(20)

      console.log('Tournament fetch result:', { data, error })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      setTournaments(data || [])
      try {
        localStorage.setItem(CACHE_KEYS.tournaments, JSON.stringify(data || []))
      } catch {}
      console.log('Tournaments set successfully:', data?.length || 0)
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      // Don't show toast in catch - let the UI handle the error state
      setTournaments([])
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      console.log('Fetching stats...')

      // Get tournament stats
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('status, entry_fee, current_players')

      // Get user count (count only, no rows)
      const { count: userCount, error: userError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })

      if (tournamentError) {
        console.error('Tournament stats error:', tournamentError)
      }

      if (userError) {
        console.error('User stats error:', userError)
      }

      if (tournamentData) {
        const totalTournaments = tournamentData.length
        const activeTournaments = tournamentData.filter(
          (t) => t.status === 'live' || t.status === 'upcoming'
        ).length
        const totalRevenue = tournamentData.reduce(
          (sum, t) => sum + t.entry_fee * t.current_players,
          0
        )

        setStats({
          totalTournaments,
          activeTournaments,
          totalUsers: userCount || 0,
          totalRevenue,
        })
        try {
          localStorage.setItem(
            CACHE_KEYS.stats,
            JSON.stringify({ totalTournaments, activeTournaments, totalUsers: userCount || 0, totalRevenue })
          )
        } catch {}

        console.log('Stats set successfully:', {
          totalTournaments,
          activeTournaments,
          totalUsers: userCount || 0,
          totalRevenue,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Don't show toast for stats errors since they're not critical
    }
    finally {
      setStatsLoading(false)
    }
  }

  const deleteTournament = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Delete error:', error)
        toast({
          title: "Error",
          description: error.message || "Failed to delete tournament",
          variant: "destructive",
        })
        return
      }

      setTournaments(prev => prev.filter(t => t.id !== id))
      toast({
        title: "Success",
        description: "Tournament deleted successfully",
      })
    } catch (error) {
      console.error('Unexpected error deleting tournament:', error)
      toast({
        title: "Error",
        description: "Failed to delete tournament",
        variant: "destructive",
      })
    }
  }

  const updateTournamentDetails = async (id: string, updates: Partial<Tournament>) => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .update(updates)
        .eq('id', id)

      if (error) {
        console.error('Update error:', error)
        toast({
          title: "Error",
          description: error.message || "Failed to update tournament",
          variant: "destructive",
        })
        return
      }

      setTournaments(prev => prev.map(t => 
        t.id === id ? { ...t, ...updates } : t
      ))
      
      setEditingTournament(null)
      setEditData({})
      
      toast({
        title: "Success",
        description: "Tournament updated successfully",
      })
    } catch (error) {
      console.error('Unexpected error updating tournament:', error)
      toast({
        title: "Error",
        description: "Failed to update tournament",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-600'
      case 'live': return 'bg-green-600'
      case 'completed': return 'bg-gray-600'
      default: return 'bg-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-slate-400">Loading admin dashboard...</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setLoading(false)
                setError('Manual override - please try loading data manually')
              }}
              variant="outline"
              size="sm"
            >
              Skip Loading
            </Button>
            <Button 
              onClick={initializeData}
              variant="outline"
              size="sm"
            >
              Retry
            </Button>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-800 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-slate-800 h-40 rounded-lg"></div>
        </div>
        <div className="text-center text-slate-400 text-sm">
          <p>If loading takes too long, there might be a database connectivity issue.</p>
          <p>Check the browser console for detailed error information.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-red-400">Error loading dashboard</p>
          </div>
        </div>
        <Card className="bg-red-900/20 border-red-500/30 p-6">
          <div className="text-center space-y-4">
            <p className="text-red-400 font-medium">Failed to load admin data</p>
            <p className="text-sm text-slate-300">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={initializeData}
                className="bg-red-600 hover:bg-red-700"
              >
                Retry Loading
              </Button>
              <Button 
                onClick={() => {
                  setError(null)
                  setTournaments([])
                  setStats({
                    totalTournaments: 0,
                    activeTournaments: 0,
                    totalUsers: 0,
                    totalRevenue: 0
                  })
                }}
                variant="outline"
              >
                Load Empty Dashboard
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Show diagnostic tools only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AuthStatusComponent />
            <DatabaseTestComponent />
          </div>
        )}
        
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-4">🚀 Quick Fix Guide</h3>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">1.</span>
              <div>
                <p className="font-medium">Run SQL Fix in Supabase:</p>
                <p className="text-slate-400">Open Supabase → SQL Editor → Run the ADMIN_PANEL_FIX.sql script</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">2.</span>
              <div>
                <p className="font-medium">Test Authentication:</p>
                <p className="text-slate-400">Sign in with Google using the auth status component above</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">3.</span>
              <div>
                <p className="font-medium">Run Database Test:</p>
                <p className="text-slate-400">Use the database diagnostics to identify remaining issues</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">🛡️ Admin Panel</h1>
            <p className="text-slate-400">Manage tournaments and monitor platform</p>
          </div>
        </div>
        <div className="flex gap-2">
          {process.env.NODE_ENV === 'development' && <DatabaseTestComponent />}
          <Button
            onClick={onCreateTournament}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Tournament
          </Button>
        </div>
      </div>      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Tournaments</p>
              <p className="text-white text-xl font-bold">{stats.totalTournaments}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Active Tournaments</p>
              <p className="text-white text-xl font-bold">{stats.activeTournaments}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Users</p>
              <p className="text-white text-xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-600 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-white text-xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Always show debug tool for troubleshooting */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Admin Controls & Debug
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AdminDebug />
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button 
                onClick={onCreateTournament}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Tournament
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Tournaments Management */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Tournament Management</h2>
          
          {tournaments.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              {error ? (
                <div>
                  <p className="text-slate-400 mb-2">Database connection issue</p>
                  <p className="text-slate-500 text-sm mb-4">Use the debug tool above to troubleshoot</p>
                </div>
              ) : (
                <p className="text-slate-400 mb-4">No tournaments loaded yet</p>
              )}
              <Button 
                onClick={onCreateTournament}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Tournament
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tournaments.map((tournament) => (
                <div 
                  key={tournament.id} 
                  className="p-4 bg-slate-700 rounded-lg border border-slate-600"
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Tournament Image */}
                    <div className="lg:w-48 flex-shrink-0">
                      <img
                        src={tournament.image_url || defaultImageForGame(tournament.game)}
                        alt={`${tournament.name} banner`}
                        className="w-full h-32 lg:h-24 object-cover rounded-lg border border-slate-600"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.jpg"
                        }}
                      />
                    </div>

                    {/* Tournament Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold">{tournament.name}</h3>
                        <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                          {tournament.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-slate-400">
                        <span>🎮 {tournament.game}</span>
                        <span>💰 Entry: ₹{tournament.entry_fee}</span>
                        <span>🏆 Prize: ₹{tournament.prize_pool}</span>
                        <span>👥 Players: {tournament.current_players}/{tournament.max_players}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        ⏰ Starts: {new Date(tournament.start_time).toLocaleString()}
                      </p>
                      
                      {/* Room Details Display */}
                      {(tournament.room_id || tournament.room_password) && (
                        <div className="mt-2 p-2 bg-blue-900/20 border border-blue-600 rounded">
                          <div className="text-xs text-blue-400 space-y-1">
                            {tournament.room_id && <div>🎯 Room ID: {tournament.room_id}</div>}
                            {tournament.room_password && <div>🔑 Password: {tournament.room_password}</div>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row lg:flex-col gap-2 lg:w-24">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingTournament(tournament.id)
                          setEditData({
                            name: tournament.name,
                            game: tournament.game,
                            entry_fee: tournament.entry_fee.toString(),
                            prize_pool: tournament.prize_pool.toString(),
                            max_players: tournament.max_players.toString(),
                            start_time: new Date(tournament.start_time).toISOString().slice(0, 16),
                            image_url: tournament.image_url || '',
                            room_id: tournament.room_id || '',
                            room_password: tournament.room_password || '',
                            status: tournament.status
                          })
                        }}
                        className="border-blue-600 text-blue-500 hover:bg-blue-600 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      
                      <Button
                        onClick={() => deleteTournament(tournament.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  {/* Comprehensive Edit Form */}
                  {editingTournament === tournament.id && (
                    <div className="mt-4 p-4 bg-slate-800 border border-slate-600 rounded-lg">
                      <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Tournament Details
                      </h4>
                      
                      <div className="space-y-4">
                        {/* Basic Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-name" className="text-slate-300">Tournament Name</Label>
                            <Input
                              id="edit-name"
                              value={editData.name || ''}
                              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-game" className="text-slate-300">Game</Label>
                            <Select value={editData.game || ''} onValueChange={(value) => setEditData(prev => ({ ...prev, game: value }))}>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Free Fire">Free Fire</SelectItem>
                                <SelectItem value="PUBG Mobile">PUBG Mobile</SelectItem>
                                <SelectItem value="Valorant">Valorant</SelectItem>
                                <SelectItem value="Call of Duty">Call of Duty</SelectItem>
                                <SelectItem value="Fortnite">Fortnite</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Financial Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="edit-entry-fee" className="text-slate-300">Entry Fee (₹)</Label>
                            <Input
                              id="edit-entry-fee"
                              type="number"
                              value={editData.entry_fee || ''}
                              onChange={(e) => setEditData(prev => ({ ...prev, entry_fee: e.target.value }))}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-prize-pool" className="text-slate-300">Prize Pool (₹)</Label>
                            <Input
                              id="edit-prize-pool"
                              type="number"
                              value={editData.prize_pool || ''}
                              onChange={(e) => setEditData(prev => ({ ...prev, prize_pool: e.target.value }))}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-max-players" className="text-slate-300">Max Players</Label>
                            <Input
                              id="edit-max-players"
                              type="number"
                              value={editData.max_players || ''}
                              onChange={(e) => setEditData(prev => ({ ...prev, max_players: e.target.value }))}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                        </div>

                        {/* Image URL */}
                        <div>
                          <Label htmlFor="edit-image-url" className="text-slate-300">Tournament Image URL</Label>
                          <Input
                            id="edit-image-url"
                            value={editData.image_url || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, image_url: e.target.value }))}
                            placeholder="https://example.com/tournament-banner.jpg"
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                          {editData.image_url && (
                            <div className="mt-2">
                              <img
                                src={editData.image_url}
                                alt="Image preview"
                                className="w-32 h-20 object-cover rounded border border-slate-600"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Tournament Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="edit-start-time" className="text-slate-300">Start Time</Label>
                            <Input
                              id="edit-start-time"
                              type="datetime-local"
                              value={editData.start_time || ''}
                              onChange={(e) => setEditData(prev => ({ ...prev, start_time: e.target.value }))}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-status" className="text-slate-300">Status</Label>
                            <Select value={editData.status || ''} onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                <SelectItem value="live">Live</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Room Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-room-id" className="text-slate-300">Room ID</Label>
                            <Input
                              id="edit-room-id"
                              value={editData.room_id || ''}
                              onChange={(e) => setEditData(prev => ({ ...prev, room_id: e.target.value }))}
                              placeholder="Enter room ID"
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-room-password" className="text-slate-300">Room Password</Label>
                            <Input
                              id="edit-room-password"
                              value={editData.room_password || ''}
                              onChange={(e) => setEditData(prev => ({ ...prev, room_password: e.target.value }))}
                              placeholder="Enter room password"
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => {
                              const updates = {
                                name: editData.name,
                                game: editData.game,
                                entry_fee: Number(editData.entry_fee),
                                prize_pool: Number(editData.prize_pool),
                                max_players: Number(editData.max_players),
                                start_time: new Date(editData.start_time || '').toISOString(),
                                image_url: editData.image_url,
                                room_id: editData.room_id,
                                room_password: editData.room_password,
                                status: editData.status
                              }
                              updateTournamentDetails(tournament.id, updates)
                            }}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save All Changes
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingTournament(null)
                              setEditData({})
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
