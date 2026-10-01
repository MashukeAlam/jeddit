import React, { createContext, useContext, useEffect, useState } from 'react'

export interface AccentColor {
  id: string
  name: string
  hex: string
  rgb: string // for rgba styling
}

export const ACCENT_PRESETS: AccentColor[] = [
  { id: 'reddit-orange', name: 'Reddit Flame', hex: '#FF4500', rgb: '255, 69, 0' },
  { id: 'neon-violet', name: 'Violet', hex: '#8B5CF6', rgb: '139, 92, 246' },
  { id: 'ocean-cyan', name: 'Ocean Cyan', hex: '#0EA5E9', rgb: '14, 165, 233' },
  { id: 'electric-emerald', name: 'Emerald', hex: '#10B981', rgb: '16, 185, 129' },
  { id: 'rose-pink', name: 'Rose', hex: '#F43F5E', rgb: '244, 63, 94' },
  { id: 'amber-gold', name: 'Amber Gold', hex: '#F59E0B', rgb: '245, 158, 11' },
  { id: 'minimal-slate', name: 'Slate', hex: '#64748B', rgb: '100, 116, 139' },
]

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  accent: AccentColor
  setAccent: (accent: AccentColor) => void
  accentPresets: AccentColor[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('jeddit_theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const [accent, setAccent] = useState<AccentColor>(() => {
    const savedId = localStorage.getItem('jeddit_accent')
    const match = ACCENT_PRESETS.find((p) => p.id === savedId)
    return match || ACCENT_PRESETS[0]
  })

  // Apply dark mode class to html and body elements + set colorScheme
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      document.body.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      document.body.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
    localStorage.setItem('jeddit_theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // Apply accent color CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accent.hex)
    document.documentElement.style.setProperty('--accent-rgb', accent.rgb)
    localStorage.setItem('jeddit_accent', accent.id)
  }, [accent])

  const toggleTheme = () => setIsDark((prev) => !prev)

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        accent,
        setAccent,
        accentPresets: ACCENT_PRESETS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
