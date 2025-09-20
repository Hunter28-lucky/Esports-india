"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export function DatabaseTestComponent() {
  const { toast } = useToast()
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testDatabase = async () => {
    setLoading(true)
    try {
      console.log('🔍 Starting comprehensive database test...')
      
      // Test 1: Basic connection
      console.log('Step 1: Testing basic connection...')
      const { data: connectionTest, error: connectionError } = await supabase
        .from('tournaments')
        .select('count')
        .limit(1)
      
      if (connectionError) {
        console.error('❌ Connection failed:', connectionError)
        toast({
          title: "❌ Database Connection Failed",
          description: `Error: ${connectionError.message}. Check Supabase URL and API key.`,
          variant: "destructive",
        })
        return
      }
      
      // Test 2: Check tournaments table structure
      console.log('Step 2: Testing tournaments table access...')
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('id, name, game, entry_fee, prize_pool, max_players, current_players, status, start_time, image_url')
        .limit(3)
      
      if (tournamentsError) {
        console.error('❌ Tournaments access failed:', tournamentsError)
        
        if (tournamentsError.message.includes('column "image_url" does not exist')) {
          toast({
            title: "🔧 Database Schema Issue",
            description: "The image_url column is missing from tournaments table. Run the SQL command to add it.",
            variant: "destructive",
          })
        } else if (tournamentsError.message.includes('policy')) {
          toast({
            title: "🔒 Permission Issue", 
            description: "Row Level Security is blocking access. You may need to log in or update RLS policies.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "❌ Tournaments Table Error",
            description: tournamentsError.message,
            variant: "destructive",
          })
        }
        return
      }
      
      // Test 3: Check user authentication
      console.log('Step 3: Checking user session...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // Test 4: Check users table (may fail due to RLS)
      console.log('Step 4: Testing users table access...')
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(1)
      
      // Success summary
      const tournamentCount = tournamentsData?.length || 0
      const hasImageColumn = tournamentsData?.[0]?.hasOwnProperty('image_url')
      
      toast({
        title: "✅ Database Test Complete",
        description: `
🔹 Connection: Working
🔹 Tournaments: ${tournamentCount} found
🔹 Image column: ${hasImageColumn ? 'Present ✅' : 'Missing ❌'}
🔹 User: ${user ? `Logged in as ${user.email?.slice(0, 20)}...` : 'Not authenticated ⚠️'}
🔹 RLS: ${usersError ? 'Restricted' : 'Open access'}
        `,
      })
      
      console.log('✅ Database test completed successfully!')
      
    } catch (error) {
      console.error('💥 Unexpected error during database test:', error)
      toast({
        title: "💥 Test Error",
        description: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-slate-700 border border-slate-600 rounded-lg">
      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
        🔧 Database Diagnostics
      </h3>
      <p className="text-slate-400 text-sm mb-3">
        Test database connectivity and identify configuration issues
      </p>
      <Button 
        onClick={testDatabase} 
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white"
        size="sm"
      >
        {loading ? "🔄 Running Tests..." : "🧪 Run Database Test"}
      </Button>
    </div>
  )
}
