"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Save } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { handleClientError } from "@/lib/error-utils"
import { useToast } from "@/hooks/use-toast"

interface AdminTournamentCreatorProps {
  onClose: () => void
  onTournamentCreated: () => void
}

export function AdminTournamentCreator({ onClose, onTournamentCreated }: AdminTournamentCreatorProps) {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    game: "Free Fire",
    entry_fee: "",
    prize_pool: "",
    max_players: "",
    start_time: "",
  image_url: "",
    room_id: "",
    room_password: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submitted!')
    console.log('isCreating:', isCreating)
    
    if (isCreating) {
      console.log('Already creating, returning early')
      return
    }
    
    // Validate form
  if (!formData.name || !formData.game || !formData.entry_fee || 
    !formData.prize_pool || !formData.max_players || !formData.start_time) {
      console.log('Validation failed - missing fields')
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      })
      return
    }

    if (Number(formData.entry_fee) <= 0 || Number(formData.prize_pool) <= 0 || Number(formData.max_players) <= 0) {
      console.log('Validation failed - invalid numbers')
      toast({
        title: "Error",
        description: "Entry fee, prize pool, and max players must be positive numbers",
        variant: "destructive",
      })
      return
    }

    const startTime = new Date(formData.start_time)
    if (startTime <= new Date()) {
      console.log('Validation failed - past start time')
      toast({
        title: "Error",
        description: "Start time must be in the future",
        variant: "destructive",
      })
      return
    }

    console.log('All validation passed, setting isCreating to true')
    setIsCreating(true)
    
    try {
      console.log('Starting tournament creation...')
      
      const tournamentData: any = {
        name: formData.name.trim(),
        game: formData.game.trim(),
        entry_fee: Number(formData.entry_fee),
        prize_pool: Number(formData.prize_pool),
        max_players: Number(formData.max_players),
        current_players: 0,
        status: 'upcoming',
        start_time: startTime.toISOString()
      }
      
      // Add optional fields if they exist
      if (formData.image_url) {
        tournamentData.image_url = formData.image_url.trim()
      }
      if (formData.room_id) {
        tournamentData.room_id = formData.room_id
      }
      if (formData.room_password) {
        tournamentData.room_password = formData.room_password
      }
      
      console.log('About to insert tournament data:', tournamentData)
      
      const { data, error } = await supabase
        .from('tournaments')
        .insert([tournamentData])
        .select()
      
      console.log('Database operation completed')
      console.log('Data:', data)
      console.log('Error:', error)
      
      if (error) {
        const { userMessage, normalized } = handleClientError(error, 'Failed to create tournament', { feature: 'admin-create-tournament', payload: tournamentData })
        try {
          console.warn('[TournamentCreate] Raw Supabase error object (stringified):', JSON.stringify(error, null, 2))
        } catch {}
        // Heuristic hints
        console.info('[TournamentCreate] Hints:')
        console.info(' - Check RLS INSERT policy on tournaments (none present -> inserts blocked).')
        console.info(' - Ensure authenticated user session exists (auth.uid() available).')
        console.info(' - Validate required columns: name, game, entry_fee, prize_pool, max_players, start_time.')
        toast({
          title: "Database Error",
            description: userMessage,
          variant: "destructive",
        })
        // Extra structured log (server safe)
        console.error('[TournamentCreate] Normalized error:', normalized)
        return
      }
      
      console.log('Tournament created successfully!')
      
      toast({
        title: "Success!",
        description: "Tournament created successfully",
      })
      
      // Reset form
      setFormData({
        name: "",
        game: "Free Fire",
        entry_fee: "",
        prize_pool: "",
        max_players: "",
        start_time: "",
        image_url: "",
        room_id: "",
        room_password: ""
      })
      
      console.log('Calling callbacks...')
      onTournamentCreated()
      onClose()
      
    } catch (error) {
      const { userMessage, normalized } = handleClientError(error, 'Failed to create tournament (unexpected)', { feature: 'admin-create-tournament', stage: 'catch' })
      toast({
        title: "Error",
        description: userMessage,
        variant: "destructive",
      })
      console.error('[TournamentCreate] Unexpected error:', normalized)
    } finally {
      console.log('Setting isCreating to false')
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-800 border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">🛡️ Admin: Create Tournament</h2>
              <p className="text-slate-400">Create a new tournament for players to join</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tournament Name */}
            <div>
              <Label htmlFor="name" className="text-white">Tournament Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Free Fire Championship Pro"
                className="bg-slate-700 border-slate-600 text-white mt-2"
              />
            </div>

            {/* Game Selection */}
            <div>
              <Label htmlFor="game" className="text-white">Game *</Label>
              <Select value={formData.game} onValueChange={(value) => handleInputChange("game", value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-2">
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

            {/* Entry Fee and Prize Pool */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entry_fee" className="text-white">Entry Fee (₹) *</Label>
                <Input
                  id="entry_fee"
                  type="number"
                  value={formData.entry_fee}
                  onChange={(e) => handleInputChange("entry_fee", e.target.value)}
                  placeholder="50"
                  className="bg-slate-700 border-slate-600 text-white mt-2"
                />
              </div>
              <div>
                <Label htmlFor="prize_pool" className="text-white">Prize Pool (₹) *</Label>
                <Input
                  id="prize_pool"
                  type="number"
                  value={formData.prize_pool}
                  onChange={(e) => handleInputChange("prize_pool", e.target.value)}
                  placeholder="5000"
                  className="bg-slate-700 border-slate-600 text-white mt-2"
                />
              </div>
            </div>

            {/* Max Players and Start Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_players" className="text-white">Max Players *</Label>
                <Input
                  id="max_players"
                  type="number"
                  value={formData.max_players}
                  onChange={(e) => handleInputChange("max_players", e.target.value)}
                  placeholder="100"
                  className="bg-slate-700 border-slate-600 text-white mt-2"
                />
              </div>
              <div>
                <Label htmlFor="start_time" className="text-white">Start Time *</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange("start_time", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white mt-2"
                />
              </div>
            </div>

            {/* Image URL with Preview */}
            <div>
              <Label htmlFor="image_url" className="text-white">Tournament Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => handleInputChange("image_url", e.target.value)}
                placeholder="https://example.com/tournament-banner.jpg"
                className="bg-slate-700 border-slate-600 text-white mt-2"
              />
              {formData.image_url && (
                <div className="mt-3">
                  <p className="text-slate-400 text-sm mb-2">Image Preview:</p>
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt="Tournament banner preview"
                      className="w-full h-32 object-cover rounded-lg border border-slate-600"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement | null
                        if (img) img.style.display = 'none'
                        const errorDiv = document.createElement('div')
                        errorDiv.className = 'w-full h-32 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center justify-center'
                        errorDiv.innerHTML = '<p class="text-red-400 text-sm">❌ Invalid image URL</p>'
                        const parent = img?.parentNode as HTMLElement | null
                        if (parent) parent.appendChild(errorDiv)
                      }}
                      onLoad={(e) => {
                        // Remove any error message when image loads successfully
                        const errorDiv = (e.target as HTMLImageElement).parentNode?.querySelector('div')
                        if (errorDiv && errorDiv.textContent?.includes('Invalid image URL')) {
                          errorDiv.remove()
                        }
                      }}
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-1">
                    ✅ Image will be displayed in tournament cards
                  </p>
                </div>
              )}
            </div>

            {/* Room Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room_id" className="text-white">Room ID (Optional)</Label>
                <Input
                  id="room_id"
                  value={formData.room_id}
                  onChange={(e) => handleInputChange("room_id", e.target.value)}
                  placeholder="e.g., 123456789"
                  className="bg-slate-700 border-slate-600 text-white mt-2"
                />
              </div>
              <div>
                <Label htmlFor="room_password" className="text-white">Room Password (Optional)</Label>
                <Input
                  id="room_password"
                  value={formData.room_password}
                  onChange={(e) => handleInputChange("room_password", e.target.value)}
                  placeholder="e.g., TOURNEY123"
                  className="bg-slate-700 border-slate-600 text-white mt-2"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isCreating}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isCreating ? "Creating..." : "Create Tournament"}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
