"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function TournamentJoinTest() {
  const { toast } = useToast()
  const [testing, setTesting] = useState(false)

  const testTournamentJoin = async () => {
    setTesting(true)
    try {
      console.log('🧪 Testing tournament join functionality...')

      // Test 1: Check if tournament_participants table exists
      const { data: participantsTest, error: participantsError } = await supabase
        .from('tournament_participants')
        .select('id')
        .limit(1)

      console.log('Participants table test:', { participantsTest, participantsError })

      // Test 2: Check if transactions table exists
      const { data: transactionsTest, error: transactionsError } = await supabase
        .from('transactions')
        .select('id')
        .limit(1)

      console.log('Transactions table test:', { transactionsTest, transactionsError })

      // Test 3: Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('Current user:', { user: user?.id, error: userError })

      // Test 4: Check available tournaments
      const { data: tournaments, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('id, name, current_players, max_players, status')
        .limit(3)

      console.log('Available tournaments:', { tournaments, tournamentsError })

      let message = '🔍 Tournament Join Test Results:\n\n'
      
      if (participantsError) {
        message += `❌ Participants table: ${participantsError.message}\n`
      } else {
        message += `✅ Participants table: Working\n`
      }

      if (transactionsError) {
        message += `❌ Transactions table: ${transactionsError.message}\n`
      } else {
        message += `✅ Transactions table: Working\n`
      }

      if (user) {
        message += `✅ User authentication: Logged in as ${user.email}\n`
      } else {
        message += `⚠️ User authentication: Not logged in\n`
      }

      if (tournaments && tournaments.length > 0) {
        message += `✅ Tournaments available: ${tournaments.length} found\n`
      } else {
        message += `⚠️ No tournaments found\n`
      }

      toast({
        title: "Tournament Join Test Complete",
        description: message,
      })

    } catch (error) {
      console.error('Test error:', error)
      toast({
        title: "Test Error",
        description: `Error during test: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="bg-slate-700 border-slate-600 p-4 mt-4">
      <h3 className="text-white font-medium mb-3">🧪 Tournament Join Diagnostics</h3>
      <Button
        onClick={testTournamentJoin}
        disabled={testing}
        className="bg-purple-600 hover:bg-purple-700"
        size="sm"
      >
        {testing ? '🔄 Testing...' : '🧪 Test Tournament Join'}
      </Button>
    </Card>
  )
}