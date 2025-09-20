"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Target, Crown, Zap, Gift } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  type: "victory" | "streak" | "milestone" | "special"
  icon: "trophy" | "star" | "target" | "crown" | "zap" | "gift"
  rarity: "common" | "rare" | "epic" | "legendary"
}

interface AchievementToastProps {
  achievement: Achievement | null
  onClose: () => void
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  target: Target,
  crown: Crown,
  zap: Zap,
  gift: Gift,
}

const rarityColors = {
  common: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  rare: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  epic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  legendary: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
}

const rarityGlow = {
  common: "text-glow",
  rare: "text-glow",
  epic: "text-glow",
  legendary: "text-glow-gold",
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (achievement) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onClose, 300)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [achievement, onClose])

  if (!achievement) return null

  const Icon = iconMap[achievement.icon]

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <Card
        className={`p-4 min-w-80 animate-achievement-pop ${
          achievement.rarity === "legendary"
            ? "gradient-border-gold"
            : achievement.rarity === "epic"
              ? "gradient-border-red"
              : "border-primary/30"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              achievement.rarity === "legendary"
                ? "bg-yellow-500/20 animate-level-up"
                : achievement.rarity === "epic"
                  ? "bg-purple-500/20 animate-victory-bounce"
                  : "bg-primary/20"
            }`}
          >
            <Icon
              className={`w-6 h-6 ${
                achievement.rarity === "legendary"
                  ? "text-yellow-400"
                  : achievement.rarity === "epic"
                    ? "text-purple-400"
                    : "text-primary"
              }`}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-bold text-foreground ${rarityGlow[achievement.rarity]}`}>{achievement.title}</h3>
              <Badge className={`text-xs ${rarityColors[achievement.rarity]} animate-pulse`}>
                {achievement.rarity.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">{achievement.description}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
