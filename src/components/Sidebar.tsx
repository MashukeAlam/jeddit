import React, { useState } from 'react'
import {
  Compass,
  Layers,
  Star,
  Hash,
  ArrowRight,
  TrendingUp,
  Cpu,
  HelpCircle,
  Image as ImageIcon,
  Gamepad2,
  Atom,
} from 'lucide-react'

interface SubredditCategory {
  title: string
  icon: React.ReactNode
  subreddits: string[]
}

const CATEGORIES: SubredditCategory[] = [
  {
    title: 'Technology & Dev',
    icon: <Cpu className="w-3.5 h-3.5 text-neutral-400" />,
    subreddits: ['technology', 'webdev', 'programming', 'reactjs', 'artificial'],
  },
  {
    title: 'Science & Discovery',
    icon: <Atom className="w-3.5 h-3.5 text-neutral-400" />,
    subreddits: ['science', 'space', 'gadgets', 'natureismetal'],
  },
  {
    title: 'Discussions & Ask',
    icon: <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />,
    subreddits: ['AskReddit', 'explainlikeimfive', 'todayilearned', 'showerthoughts'],
  },
  {
    title: 'Visual & Arts',
    icon: <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />,
    subreddits: ['pics', 'EarthPorn', 'art', 'wallpapers'],
  },
  {
    title: 'Gaming',
    icon: <Gamepad2 className="w-3.5 h-3.5 text-neutral-400" />,
    subreddits: ['gaming', 'pcgaming', 'games'],
  },
]

interface SidebarProps {
  currentSubreddit: string
  onSelectSubreddit: (sub: string) => void
  favorites: string[]
  onRemoveFavorite: (sub: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSubreddit,
  onSelectSubreddit,
  favorites,
  onRemoveFavorite,
}) => {
  const [jumpInput, setJumpInput] = useState('')

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = jumpInput.trim().replace(/^r\//, '')
    if (clean) {
      onSelectSubreddit(clean)
      setJumpInput('')
    }
  }

  const isSelected = (sub: string) =>
    currentSubreddit.toLowerCase() === sub.toLowerCase()

  return (
    <aside className="w-full space-y-5">
      {/* Quick Jump Input */}
      <form onSubmit={handleJumpSubmit} className="relative">
        <input
          type="text"
          value={jumpInput}
          onChange={(e) => setJumpInput(e.target.value)}
          placeholder="Jump to r/subreddit..."
          className="w-full pl-8 pr-8 py-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-color)] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 shadow-2xs"
        />
        <Hash className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
        {jumpInput && (
          <button
            type="submit"
            className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Primary Feeds */}
      <div className="p-3 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-md">
        <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-2 py-1 mb-1">
          Feeds
        </div>
        <div className="space-y-0.5">
          <button
            onClick={() => onSelectSubreddit('popular')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isSelected('popular')
                ? 'accent-bg-subtle accent-text'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Popular</span>
          </button>

          <button
            onClick={() => onSelectSubreddit('all')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isSelected('all')
                ? 'accent-bg-subtle accent-text'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All</span>
          </button>
        </div>
      </div>

      {/* User Favorites (if any) */}
      {favorites.length > 0 && (
        <div className="p-3 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-md">
          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-2 py-1 mb-1">
            <span>Favorites</span>
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          </div>
          <div className="space-y-0.5">
            {favorites.map((fav) => (
              <div
                key={fav}
                className={`group flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  isSelected(fav)
                    ? 'accent-bg-subtle accent-text font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                }`}
              >
                <button
                  onClick={() => onSelectSubreddit(fav)}
                  className="flex-1 text-left truncate"
                >
                  r/{fav}
                </button>
                <button
                  onClick={() => onRemoveFavorite(fav)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 p-1 transition-opacity text-xs"
                  title="Remove from favorites"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Curated Subreddits by Category */}
      <div className="p-3 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-2 pt-1">
          <Compass className="w-3.5 h-3.5" />
          <span>Explore Communities</span>
        </div>

        {CATEGORIES.map((cat) => (
          <div key={cat.title} className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 px-2">
              {cat.icon}
              <span>{cat.title}</span>
            </div>
            <div className="space-y-0.5">
              {cat.subreddits.map((sub) => (
                <button
                  key={sub}
                  onClick={() => onSelectSubreddit(sub)}
                  className={`w-full flex items-center px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    isSelected(sub)
                      ? 'accent-bg-subtle accent-text font-semibold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  r/{sub}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Minimal Footer */}
      <div className="px-3 text-[11px] text-neutral-400 dark:text-neutral-600 space-y-1">
        <p className="font-semibold text-neutral-500 dark:text-neutral-500">
          Jeddit • Minimalist Reddit Client
        </p>
        <p>Built with Vite, React & Tailwind</p>
      </div>
    </aside>
  )
}
