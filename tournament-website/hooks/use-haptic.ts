"use client"

import { useCallback } from "react"

export type HapticPattern =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "error"
  | "warning"
  | "notification"
  | "button"
  | "victory"
  | "join"

const hapticPatterns: Record<HapticPattern, number | number[]> = {
  light: 50,
  medium: 100,
  heavy: 200,
  success: [100, 50, 100, 50, 200],
  error: [200, 100, 200],
  warning: [150, 100, 150],
  notification: [100, 50, 100],
  button: 25,
  victory: [200, 100, 200, 100, 300, 100, 400],
  join: [100, 50, 100, 50, 100],
}

export function useHaptic() {
  const triggerHaptic = useCallback((pattern: HapticPattern) => {
    if (!navigator.vibrate) {
      return false
    }

    try {
      const vibrationPattern = hapticPatterns[pattern]
      navigator.vibrate(vibrationPattern)
      return true
    } catch (error) {
      console.warn("Haptic feedback failed:", error)
      return false
    }
  }, [])

  const isSupported = useCallback(() => {
    return "vibrate" in navigator
  }, [])

  return {
    triggerHaptic,
    isSupported,
  }
}
