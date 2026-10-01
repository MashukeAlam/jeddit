import React from 'react'

export const PostSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/50 p-5 space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="w-24 h-3.5 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="w-16 h-3 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <div className="w-5/6 h-5 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="w-2/3 h-5 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>

      {/* Media placeholder */}
      <div className="w-full h-52 rounded-xl bg-neutral-200/80 dark:bg-neutral-800/80" />

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="w-24 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="w-20 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  )
}

export const FeedSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  )
}
