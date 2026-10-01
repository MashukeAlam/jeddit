import React, { useState, useRef, useEffect } from 'react'
import { Palette, Check } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export const AccentPicker: React.FC = () => {
  const { accent, setAccent, accentPresets } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change accent color"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-xs font-medium"
      >
        <span
          className="w-3.5 h-3.5 rounded-full inline-block shadow-sm"
          style={{ backgroundColor: accent.hex }}
        />
        <Palette className="w-3.5 h-3.5 text-neutral-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl z-50">
          <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-2 py-1 mb-1">
            Accent Color
          </div>
          <div className="space-y-1">
            {accentPresets.map((preset) => {
              const isSelected = preset.id === accent.id
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setAccent(preset)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span>{preset.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
