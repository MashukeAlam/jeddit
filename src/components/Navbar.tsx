import React, { useState } from 'react'
import {
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Flame,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { AccentPicker } from './UI/AccentPicker'

interface NavbarProps {
  currentSubreddit: string
  onSearch: (query: string) => void
  onSelectSubreddit: (sub: string) => void
  onToggleMobileSidebar: () => void
  isMobileSidebarOpen: boolean
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSubreddit,
  onSearch,
  onSelectSubreddit,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const { isDark, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-neutral-900/85 backdrop-blur-md border-b border-neutral-200/90 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle navigation"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => onSelectSubreddit('popular')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-8 h-8 rounded-xl accent-bg flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4 fill-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-base tracking-tight text-neutral-900 dark:text-neutral-100">
                Jeddit
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                ['popular', 'all', 'home'].includes(currentSubreddit.toLowerCase())
                  ? 'Search Reddit...'
                  : `Search r/${currentSubreddit}...`
              }
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full bg-neutral-100/90 dark:bg-neutral-800/80 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 focus:outline-hidden text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 transition-all"
            />
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          </form>
        </div>

        {/* Right: Actions (Accent Picker, Dark Mode Toggle) */}
        <div className="flex items-center gap-2">
          {/* Accent Color Picker */}
          <AccentPicker />

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </button>
        </div>
      </div>
    </header>
  )
}
