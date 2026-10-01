import React, { useEffect, useState } from 'react'
import {
  X,
  ExternalLink,
  ArrowBigUp,
  MessageSquare,
  Share2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import type { RedditPost, RedditComment, RedditMore } from '../../types/reddit'
import { fetchPostDetail } from '../../services/redditApi'
import { formatNumber, formatTimeAgo, decodeHtmlEntities } from '../../utils/helpers'
import { MediaRenderer } from '../MediaRenderer'
import { CommentTree } from './CommentTree'

interface PostDetailModalProps {
  post: RedditPost | null
  onClose: () => void
  onImageClick?: (url: string) => void
  onSubredditClick?: (sub: string) => void
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  onClose,
  onImageClick,
  onSubredditClick,
}) => {
  const [comments, setComments] = useState<(RedditComment | RedditMore)[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!post) return

    let isMounted = true
    setLoading(true)
    setError(null)

    fetchPostDetail(post.permalink)
      .then((data) => {
        if (isMounted) {
          setComments(data.comments)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load comments.')
          setLoading(false)
        }
      })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    // Lock body scroll
    document.body.style.overflow = 'hidden'

    return () => {
      isMounted = false
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [post, onClose])

  if (!post) return null

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `https://reddit.com${post.permalink}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl min-h-screen sm:min-h-0 sm:max-h-[92vh] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <button
              onClick={() => {
                onSubredditClick?.(post.subreddit)
                onClose()
              }}
              className="text-xs font-semibold hover:underline accent-text truncate"
            >
              {post.subreddit_name_prefixed}
            </button>
            <span className="text-neutral-400 text-xs">•</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              u/{post.author}
            </span>
            <span className="text-neutral-400 text-xs">•</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatTimeAgo(post.created_utc)}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://reddit.com${post.permalink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Open on Reddit"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {/* Post Flair */}
          {post.link_flair_text && (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {decodeHtmlEntities(post.link_flair_text)}
            </span>
          )}

          {/* Post Title */}
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
            {decodeHtmlEntities(post.title)}
          </h2>

          {/* Media Content */}
          <MediaRenderer
            post={post}
            isDetailView={true}
            onImageClick={onImageClick}
          />

          {/* Stats Bar */}
          <div className="flex items-center gap-4 py-2 border-y border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200">
              <ArrowBigUp className="w-4 h-4 accent-text" />
              <span>{formatNumber(post.score)} points</span>
              <span className="text-neutral-400 font-normal">
                ({Math.round(post.upvote_ratio * 100)}% upvoted)
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-medium">
              <MessageSquare className="w-4 h-4" />
              <span>{formatNumber(post.num_comments)} comments</span>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors ml-auto"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied Link!' : 'Share'}</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="pt-2">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Comments ({formatNumber(post.num_comments)})
            </h3>

            {loading && (
              <div className="py-12 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin accent-text" />
                <span className="text-xs">Loading comment discussions...</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && (
              <CommentTree comments={comments} opAuthor={post.author} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
