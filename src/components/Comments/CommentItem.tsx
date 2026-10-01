import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ChevronDown,
  ChevronRight,
  Shield,
  Pin,
  CornerDownRight,
  ArrowBigUp,
} from 'lucide-react'
import type { RedditComment, RedditMore } from '../../types/reddit'
import { formatNumber, formatTimeAgo, decodeHtmlEntities } from '../../utils/helpers'

// Repeating indentation line colors for deep comment trees
const DEPTH_COLORS = [
  'border-l-blue-400/50 hover:border-l-blue-500',
  'border-l-violet-400/50 hover:border-l-violet-500',
  'border-l-emerald-400/50 hover:border-l-emerald-500',
  'border-l-amber-400/50 hover:border-l-amber-500',
  'border-l-rose-400/50 hover:border-l-rose-500',
  'border-l-cyan-400/50 hover:border-l-cyan-500',
]

interface CommentItemProps {
  comment: RedditComment
  opAuthor?: string
  depth?: number
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  opAuthor,
  depth = 0,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Safe extraction for Reddit's empty string `replies: ""` trap
  const rawReplies =
    typeof comment.replies === 'object' && comment.replies?.data?.children
      ? comment.replies.data.children
      : []

  const childComments = rawReplies
    .filter((c): c is { kind: string; data: RedditComment } => c.kind === 't1')
    .map((c) => c.data)

  const moreObject = rawReplies.find(
    (c): c is { kind: string; data: RedditMore } => c.kind === 'more'
  )?.data

  const isOp = comment.is_submitter || (opAuthor && comment.author === opAuthor)
  const isDeleted = comment.author === '[deleted]' || comment.body === '[deleted]'
  const depthColor = DEPTH_COLORS[depth % DEPTH_COLORS.length]

  if (isCollapsed) {
    return (
      <div className="py-1.5 pl-3 border-l-2 border-neutral-300 dark:border-neutral-800 text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-2 cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30 rounded-r-lg transition-colors"
        onClick={() => setIsCollapsed(false)}
      >
        <button className="flex items-center gap-1 font-mono font-medium hover:text-neutral-700 dark:hover:text-neutral-200">
          <ChevronRight className="w-3.5 h-3.5" />
          <span>u/{comment.author}</span>
        </button>
        <span>•</span>
        <span>{formatTimeAgo(comment.created_utc)}</span>
        <span>•</span>
        <span className="accent-text font-medium">
          [+{childComments.length + 1} collapsed]
        </span>
      </div>
    )
  }

  return (
    <div
      className={`relative pt-2 pb-1 text-sm transition-colors ${
        depth > 0 ? `pl-3 sm:pl-4 border-l-2 ${depthColor} ml-1 sm:ml-2 mt-1.5` : ''
      }`}
    >
      {/* Comment Header */}
      <div className="flex items-center flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
        <button
          onClick={() => setIsCollapsed(true)}
          className="flex items-center gap-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          title="Collapse thread"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        <span
          className={`font-medium ${
            isOp
              ? 'accent-text font-semibold'
              : 'text-neutral-800 dark:text-neutral-200'
          }`}
        >
          u/{comment.author}
        </span>

        {/* OP Badge */}
        {isOp && (
          <span className="px-1.5 py-0.2 rounded accent-bg text-white text-[10px] font-bold tracking-wider">
            OP
          </span>
        )}

        {/* Mod Badge */}
        {comment.distinguished === 'moderator' && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-medium border border-emerald-500/20">
            <Shield className="w-3 h-3" />
            MOD
          </span>
        )}

        {/* Stickied Badge */}
        {comment.stickied && (
          <span className="inline-flex items-center gap-0.5 text-emerald-500 text-[10px] font-medium">
            <Pin className="w-3 h-3" />
            Pinned
          </span>
        )}

        <span>•</span>
        <div className="flex items-center gap-1 font-mono">
          <ArrowBigUp className="w-3.5 h-3.5 text-neutral-400" />
          <span>{comment.score_hidden ? '•' : formatNumber(comment.score)}</span>
        </div>

        <span>•</span>
        <span>{formatTimeAgo(comment.created_utc)}</span>
      </div>

      {/* Comment Body */}
      <div className="text-neutral-800 dark:text-neutral-200 pl-4 py-0.5">
        {isDeleted ? (
          <p className="italic text-neutral-400 dark:text-neutral-600 text-xs">
            [Comment deleted or removed]
          </p>
        ) : (
          <div className="prose-jeddit text-xs sm:text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {decodeHtmlEntities(comment.body)}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Nested Replies Recursion */}
      {childComments.length > 0 && (
        <div className="space-y-1 mt-1">
          {childComments.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              opAuthor={opAuthor}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {/* More stubs indicator */}
      {moreObject && moreObject.count > 0 && (
        <div className="pl-4 pt-1.5 text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
          <CornerDownRight className="w-3 h-3" />
          <span>
            {moreObject.count} more replies on Reddit
          </span>
        </div>
      )}
    </div>
  )
}
