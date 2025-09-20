"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { User, LogIn, LogOut } from 'lucide-react'

export function AuthStatusComponent() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <Card className="bg-slate-700 border-slate-600 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-600 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-slate-600 rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-700 border-slate-600 p-4">
      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
        <User className="w-4 h-4" />
        Authentication Status
      </h3>
      
      {user ? (
        <div className="space-y-3">
          <div className="text-sm">
            <p className="text-green-400 font-medium">✅ Logged In</p>
            <p className="text-slate-300">Email: {user.email}</p>
            <p className="text-slate-400 text-xs">ID: {user.id?.slice(0, 8)}...</p>
          </div>
          <Button 
            onClick={signOut}
            variant="outline"
            size="sm"
            className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm">
            <p className="text-yellow-400 font-medium">⚠️ Not Authenticated</p>
            <p className="text-slate-400">Some admin features may be restricted</p>
          </div>
          <Button 
            onClick={signInWithGoogle}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In with Google
          </Button>
        </div>
      )}
    </Card>
  )
}