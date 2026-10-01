import React from 'react'
import { MessageSquareOff } from 'lucide-react'
import type { RedditComment, RedditMore } from '../../types/reddit'
import { CommentItem } from './CommentItem'

interface CommentTreeProps {
  comments: (RedditComment | RedditMore)[]
  opAuthor?: string
}

export const CommentTree: React.FC<CommentTreeProps> = ({ comments, opAuthor }) => {
  const rootComments = comments.filter(
    (c): c is RedditComment => 'body' in c && Boolean(c.body)
  )

  if (rootComments.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center text-neutral-400 dark:text-neutral-500">
        <MessageSquareOff className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm font-medium">No comments yet</p>
        <p className="text-xs">Be the first to see discussions on Reddit!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 pt-2">
      {rootComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          opAuthor={opAuthor}
          depth={0}
        />
      ))}
    </div>
  )
}
