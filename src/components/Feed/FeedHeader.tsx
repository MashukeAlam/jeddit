import React from 'react'
import { Users, Activity, Star } from 'lucide-react'
import type { RedditSubredditAbout } from '../../types/reddit'
import { formatNumber, decodeHtmlEntities } from '../../utils/helpers'

interface FeedHeaderProps {
  subreddit: string
  about: RedditSubredditAbout | null
  isFavorite: boolean
  onToggleFavorite: () => void
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  subreddit,
  about,
  isFavorite,
  onToggleFavorite,
}) => {
  const isSpecialFeed = ['popular', 'all', 'home'].includes(subreddit.toLowerCase())
  const bannerImg = about?.banner_background_image
    ? decodeHtmlEntities(about.banner_background_image.split('?')[0])
    : null

  const iconImg = about?.community_icon
    ? decodeHtmlEntities(about.community_icon.split('?')[0])
    : about?.icon_img
    ? decodeHtmlEntities(about.icon_img)
    : null

  if (isSpecialFeed) {
    return (
      <div className="mb-4 p-5 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-md">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 capitalize">
          {subreddit === 'popular' ? 'Popular Posts' : subreddit === 'all' ? 'All of Reddit' : 'Home Feed'}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {subreddit === 'popular'
            ? 'The most active and viral discussions across Reddit right now.'
            : 'Unfiltered stream of posts across all public subreddits.'}
        </p>
      </div>
    )
  }

  return (
    <div className="mb-5 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/50 overflow-hidden backdrop-blur-md shadow-2xs">
      {/* Banner */}
      {bannerImg && (
        <div className="h-28 sm:h-36 w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 relative">
          <img
            src={bannerImg}
            alt={`${subreddit} banner`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* Header Info */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {iconImg ? (
              <img
                src={iconImg}
                alt={subreddit}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white dark:border-neutral-800 shadow-md object-cover bg-white"
              />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full accent-bg flex items-center justify-center text-white font-bold text-xl shadow-md">
                r/
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  r/{subreddit}
                </h1>
                <button
                  onClick={onToggleFavorite}
                  className={`p-1.5 rounded-full transition-colors ${
                    isFavorite
                      ? 'text-amber-500 bg-amber-500/10'
                      : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                  }`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
                </button>
              </div>

              {about?.title && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  {decodeHtmlEntities(about.title)}
                </p>
              )}
            </div>
          </div>

          {/* Stats Badges */}
          {about && (
            <div className="hidden sm:flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-neutral-400" />
                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                  {formatNumber(about.subscribers)}
                </span>
                <span>members</span>
              </div>

              {about.active_user_count !== undefined && (
                <div className="flex items-center gap-1.5 font-medium">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    {formatNumber(about.active_user_count)}
                  </span>
                  <span>online</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Subreddit Description */}
        {about?.public_description && (
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            {decodeHtmlEntities(about.public_description)}
          </p>
        )}
      </div>
    </div>
  )
}
