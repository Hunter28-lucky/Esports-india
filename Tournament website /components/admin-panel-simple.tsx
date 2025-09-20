"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { DatabaseTestComponent } from "./database-test"
import { AuthStatusComponent } from "./auth-status"
import AdminDebug from "./admin-debug"

interface AdminPanelProps {
  onCreateTournament: () => void
}

export function AdminPanelSimple({ onCreateTournament }: AdminPanelProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalUsers: 0,
    totalRevenue: 0
  })
  
  const fetchStats = async () => {
    setLoading(true)
    try {
      // Get tournament stats
      const { data: tournaments, error } = await supabase
        .from('tournaments')
        .select('*')
        .limit(10)
      
      if (error) {
        console.error('Error fetching tournaments:', error)
        toast({
          title: "Error",
          description: "Failed to load tournaments",
          variant: "destructive",
        })
        return
      }
      
      if (tournaments) {
        setStats({
          totalTournaments: tournaments.length,
          activeTournaments: tournaments.filter(t => t.status === 'upcoming' || t.status === 'live').length,
          totalUsers: 0, // Will be updated later
          totalRevenue: tournaments.reduce((sum, t) => sum + (t.entry_fee || 0) * (t.current_players || 0), 0)
        })
      }
      
      // Get user count in a separate query
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      if (count !== null) {
        setStats(prev => ({
          ...prev,
          totalUsers: count
        }))
      }
      
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchStats()
  }, [])
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your tournaments and users</p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Tournaments</p>
          <h3 className="text-2xl font-bold text-white mt-1">{stats.totalTournaments}</h3>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-sm text-slate-400">Active Tournaments</p>
          <h3 className="text-2xl font-bold text-white mt-1">{stats.activeTournaments}</h3>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Users</p>
          <h3 className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</h3>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Revenue</p>
          <h3 className="text-2xl font-bold text-white mt-1">₹{stats.totalRevenue}</h3>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mt-4">
        <Button 
          onClick={onCreateTournament}
          className="bg-primary hover:bg-primary/90"
        >
          Create Tournament
        </Button>
        
        <Button 
          onClick={fetchStats}
          variant="outline" 
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Stats"}
        </Button>
      </div>
      
      {/* Diagnostic Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <h3 className="font-bold text-white mb-3">Auth Status</h3>
          <AuthStatusComponent />
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 p-4">
          <h3 className="font-bold text-white mb-3">Database Connection</h3>
          <DatabaseTestComponent />
        </Card>
      </div>
      
      {/* Advanced Tools */}
      <Card className="bg-slate-800 border-slate-700 p-4 mt-4">
        <h3 className="font-bold text-white mb-3">Advanced Tools</h3>
        <div className="space-y-3">
          <AdminDebug />
        </div>
      </Card>
    </div>
  )
}