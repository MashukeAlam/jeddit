import React, { useState } from 'react'
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  ExternalLink,
  Pin,
  Lock,
} from 'lucide-react'
import type { RedditPost } from '../../types/reddit'
import { formatNumber, formatTimeAgo, decodeHtmlEntities } from '../../utils/helpers'
import { MediaRenderer } from '../MediaRenderer'

interface PostCardProps {
  post: RedditPost
  onPostClick: (post: RedditPost) => void
  onSubredditClick?: (sub: string) => void
  onImageClick?: (url: string) => void
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostClick,
  onSubredditClick,
  onImageClick,
}) => {
  // Local vote state for tactile user feedback
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  const [copied, setCopied] = useState(false)

  const currentScore = post.score + (vote === 'up' ? 1 : vote === 'down' ? -1 : 0)

  const handleVote = (direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation()
    setVote((prev) => (prev === direction ? null : direction))
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `https://reddit.com${post.permalink}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <article
      onClick={() => onPostClick(post)}
      className="group relative rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700/80 p-4 sm:p-5 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
    >
      {/* Sticky indicator line */}
      {post.stickied && (
        <div className="absolute top-0 left-6 right-6 h-0.5 accent-bg rounded-full opacity-80" />
      )}

      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-2">
        <div className="flex items-center flex-wrap gap-1.5 overflow-hidden">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSubredditClick?.(post.subreddit)
            }}
            className="font-bold text-neutral-900 dark:text-neutral-100 hover:underline accent-text truncate"
          >
            {post.subreddit_name_prefixed}
          </button>

          <span>•</span>
          <span className="truncate">u/{post.author}</span>

          <span>•</span>
          <span className="shrink-0">{formatTimeAgo(post.created_utc)}</span>

          {post.stickied && (
            <span className="inline-flex items-center gap-0.5 text-emerald-500 font-medium ml-1">
              <Pin className="w-3 h-3" />
              Pinned
            </span>
          )}

          {post.locked && (
            <span className="inline-flex items-center gap-0.5 text-amber-500 font-medium ml-1">
              <Lock className="w-3 h-3" />
              Locked
            </span>
          )}
        </div>

        {/* Link Flair */}
        {post.link_flair_text && (
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60 max-w-[120px] truncate">
            {decodeHtmlEntities(post.link_flair_text)}
          </span>
        )}
      </div>

      {/* Post Title */}
      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 leading-snug group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors mb-1">
        {decodeHtmlEntities(post.title)}
      </h3>

      {/* Rich Media Content */}
      <MediaRenderer
        post={post}
        isDetailView={false}
        onImageClick={onImageClick}
      />

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between gap-3 pt-3 mt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs text-neutral-500 dark:text-neutral-400">
        {/* Vote Counter Pill */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800/60 rounded-full p-0.5 border border-neutral-200/60 dark:border-neutral-700/40">
          <button
            onClick={(e) => handleVote('up', e)}
            className={`p-1 rounded-full transition-colors ${
              vote === 'up'
                ? 'accent-text accent-bg-subtle font-bold'
                : 'hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
            title="Upvote"
          >
            <ArrowBigUp className="w-4 h-4" />
          </button>
          <span
            className={`px-1.5 font-mono text-xs font-semibold ${
              vote === 'up'
                ? 'accent-text'
                : vote === 'down'
                ? 'text-blue-500'
                : 'text-neutral-700 dark:text-neutral-300'
            }`}
          >
            {formatNumber(currentScore)}
          </span>
          <button
            onClick={(e) => handleVote('down', e)}
            className={`p-1 rounded-full transition-colors ${
              vote === 'down'
                ? 'text-blue-500 bg-blue-500/10 font-bold'
                : 'hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
            title="Downvote"
          >
            <ArrowBigDown className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons Right */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Comments Button */}
          <button
            onClick={() => onPostClick(post)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium text-neutral-600 dark:text-neutral-300"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{formatNumber(post.num_comments)}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Copy post link"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
          </button>

          {/* Direct Reddit Permlink */}
          <a
            href={`https://reddit.com${post.permalink}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            title="Open on Reddit"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </article>
  )
}
