"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface CelebrationEffectsProps {
  trigger: boolean
  type: "victory" | "money" | "achievement" | "streak"
  onComplete?: () => void
}

export function CelebrationEffects({ trigger, type, onComplete }: CelebrationEffectsProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number }>>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [trigger, onComplete])

  if (!mounted || !trigger || particles.length === 0) {
    return null
  }

  const getParticleColor = (index: number) => {
    const colors = {
      victory: ["#22c55e", "#16a34a", "#15803d"],
      money: ["#f59e0b", "#fbbf24", "#f97316"],
      achievement: ["#8b5cf6", "#a855f7", "#9333ea"],
      streak: ["#dc2626", "#ef4444", "#f87171"],
    }
    return colors[type][index % colors[type].length]
  }

  return createPortal(
    <div className="celebration-particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            backgroundColor: getParticleColor(particle.id),
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>,
    document.body,
  )
}
