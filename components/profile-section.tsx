"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Trophy, Target, Crown, Award, Edit, Save, X } from "lucide-react"

export function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Alex Chen",
    email: "alex.chen@gmail.com",
    joinDate: "January 2024",
    bio: "Passionate gamer and tournament competitor. Love playing battle royale games and tactical shooters.",
    favoriteGame: "Free Fire",
    country: "India",
    city: "Mumbai",
  })

  const [editData, setEditData] = useState(profileData)

  const handleSave = () => {
    setProfileData(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(profileData)
    setIsEditing(false)
  }

  const achievements = [
    {
      id: "1",
      title: "First Victory",
      description: "Won your first tournament",
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      earned: true,
      date: "Feb 2024",
    },
    {
      id: "2",
      title: "Sharpshooter",
      description: "Get 100+ kills in tournaments",
      icon: <Target className="w-6 h-6 text-orange-500" />,
      earned: true,
      date: "Mar 2024",
    },
    {
      id: "3",
      title: "Tournament Regular",
      description: "Participate in 10+ tournaments",
      icon: <Crown className="w-6 h-6 text-purple-500" />,
      earned: true,
      date: "Apr 2024",
    },
    {
      id: "4",
      title: "Top Performer",
      description: "Reach top 3 in 5 tournaments",
      icon: <Award className="w-6 h-6 text-green-500" />,
      earned: false,
      date: null,
    },
    {
      id: "5",
      title: "Kill Master",
      description: "Get 500+ total kills",
      icon: <Target className="w-6 h-6 text-red-500" />,
      earned: true,
      date: "May 2024",
    },
    {
      id: "6",
      title: "Champion",
      description: "Win 10+ tournaments",
      icon: <Crown className="w-6 h-6 text-yellow-500" />,
      earned: false,
      date: null,
    },
  ]

  const stats = {
    totalTournaments: 24,
    wins: 12,
    totalKills: 847,
    totalEarnings: 18450,
    winRate: 50,
    averageKills: 35.3,
    bestPlacement: 1,
    currentStreak: 3,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-slate-400">Manage your account and view your gaming achievements</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          className={`${
            isEditing ? "bg-slate-600 hover:bg-slate-700 text-white" : "bg-cyan-500 hover:bg-cyan-600 text-white"
          }`}
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {/* Profile Info */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src="/images/avatar-alexchen.png" />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
              <Badge className="bg-cyan-600 text-white border-0 mb-2">Rising Star</Badge>
              <p className="text-slate-400 text-sm text-center md:text-left">Member since {profileData.joinDate}</p>
            </div>
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio" className="text-white">
                      Bio
                    </Label>
                    <Input
                      id="bio"
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country" className="text-white">
                        Country
                      </Label>
                      <Input
                        id="country"
                        value={editData.country}
                        onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-white">
                        City
                      </Label>
                      <Input
                        id="city"
                        value={editData.city}
                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-slate-600 text-slate-300 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{profileData.name}</h2>
                    <p className="text-slate-400">{profileData.bio}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{profileData.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Joined {profileData.joinDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">
                        {profileData.country}, {profileData.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Favorite: {profileData.favoriteGame}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <p className="text-2xl font-bold text-cyan-400">{stats.totalTournaments}</p>
              <p className="text-slate-400 text-sm">Tournaments</p>
            </div>
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <p className="text-2xl font-bold text-green-400">{stats.wins}</p>
              <p className="text-slate-400 text-sm">Wins</p>
            </div>
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <p className="text-2xl font-bold text-orange-400">{stats.totalKills}</p>
              <p className="text-slate-400 text-sm">Total Kills</p>
            </div>
            <div className="text-center p-4 bg-slate-700 rounded-lg">
              <p className="text-2xl font-bold text-yellow-400">₹{stats.totalEarnings.toLocaleString()}</p>
              <p className="text-slate-400 text-sm">Earnings</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  achievement.earned
                    ? "bg-slate-700 border-green-600/30"
                    : "bg-slate-700/50 border-slate-600 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {achievement.icon}
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm">{achievement.title}</h4>
                    {achievement.earned && achievement.date && (
                      <p className="text-green-400 text-xs">Earned {achievement.date}</p>
                    )}
                  </div>
                  {achievement.earned && <Badge className="bg-green-600 text-white border-0 text-xs">Earned</Badge>}
                </div>
                <p className="text-slate-400 text-sm">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
