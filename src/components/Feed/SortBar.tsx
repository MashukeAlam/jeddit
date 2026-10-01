import React from 'react'
import { Flame, Sparkles, TrendingUp, Zap } from 'lucide-react'
import type { SortType, TimeFilter } from '../../types/reddit'

interface SortBarProps {
  currentSort: SortType
  onSortChange: (sort: SortType) => void
  currentTimeFilter: TimeFilter
  onTimeFilterChange: (time: TimeFilter) => void
}

export const SortBar: React.FC<SortBarProps> = ({
  currentSort,
  onSortChange,
  currentTimeFilter,
  onTimeFilterChange,
}) => {
  const sortOptions: { type: SortType; label: string; icon: React.ReactNode }[] = [
    { type: 'hot', label: 'Hot', icon: <Flame className="w-4 h-4" /> },
    { type: 'new', label: 'New', icon: <Sparkles className="w-4 h-4" /> },
    { type: 'top', label: 'Top', icon: <TrendingUp className="w-4 h-4" /> },
    { type: 'rising', label: 'Rising', icon: <Zap className="w-4 h-4" /> },
  ]

  const timeOptions: { filter: TimeFilter; label: string }[] = [
    { filter: 'day', label: 'Today' },
    { filter: 'week', label: 'This Week' },
    { filter: 'month', label: 'This Month' },
    { filter: 'year', label: 'This Year' },
    { filter: 'all', label: 'All Time' },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-md mb-4 shadow-2xs">
      {/* Sort Buttons */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {sortOptions.map((opt) => {
          const isActive = currentSort === opt.type
          return (
            <button
              key={opt.type}
              onClick={() => onSortChange(opt.type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? 'accent-bg text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          )
        })}
      </div>

      {/* Top Time Filter Options */}
      {currentSort === 'top' && (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pl-1">
          {timeOptions.map((t) => {
            const isSelected = currentTimeFilter === t.filter
            return (
              <button
                key={t.filter}
                onClick={() => onTimeFilterChange(t.filter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  isSelected
                    ? 'accent-bg-subtle accent-text font-bold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
