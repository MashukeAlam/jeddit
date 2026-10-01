import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  AlertCircle,
  RefreshCw,
  ArrowDown,
  Layers,
  WifiOff,
} from 'lucide-react'
import type { RedditPost, RedditSubredditAbout, SortType, TimeFilter } from './types/reddit'
import { fetchFeed, fetchSubredditAbout, searchReddit } from './services/redditApi'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { FeedHeader } from './components/Feed/FeedHeader'
import { SortBar } from './components/Feed/SortBar'
import { PostCard } from './components/Feed/PostCard'
import { FeedSkeleton } from './components/UI/LoadingSkeleton'
import { PostDetailModal } from './components/Comments/PostDetailModal'
import { ImageLightbox } from './components/UI/ImageLightbox'

export const App: React.FC = () => {
  // Navigation & Feed State
  const [currentSubreddit, setCurrentSubreddit] = useState<string>('popular')
  const [sort, setSort] = useState<SortType>('hot')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('day')
  const [searchQuery, setSearchQuery] = useState<string | null>(null)

  // Data State
  const [posts, setPosts] = useState<RedditPost[]>([])
  const [subredditAbout, setSubredditAbout] = useState<RedditSubredditAbout | null>(null)
  const [afterCursor, setAfterCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false)

  // Interactive Overlays
  const [selectedPost, setSelectedPost] = useState<RedditPost | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false)

  // Saved Favorites in LocalStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jeddit_favorites')
      return saved ? JSON.parse(saved) : ['webdev', 'technology', 'space', 'AskReddit', 'pics']
    } catch {
      return ['webdev', 'technology', 'space', 'AskReddit', 'pics']
    }
  })

  // Observer ref for automatic infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const isFavorite = favorites.map((f) => f.toLowerCase()).includes(currentSubreddit.toLowerCase())

  const toggleFavorite = () => {
    setFavorites((prev) => {
      const clean = currentSubreddit.toLowerCase()
      let updated: string[]
      if (prev.map((f) => f.toLowerCase()).includes(clean)) {
        updated = prev.filter((f) => f.toLowerCase() !== clean)
      } else {
        updated = [...prev, currentSubreddit]
      }
      localStorage.setItem('jeddit_favorites', JSON.stringify(updated))
      return updated
    })
  }

  const removeFavorite = (sub: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.toLowerCase() !== sub.toLowerCase())
      localStorage.setItem('jeddit_favorites', JSON.stringify(updated))
      return updated
    })
  }

  // Load feed posts
  const loadFeed = useCallback(
    async (reset = true) => {
      if (reset) {
        setLoading(true)
        setError(null)
      } else {
        setLoadingMore(true)
      }

      try {
        let result
        if (searchQuery) {
          result = await searchReddit({
            query: searchQuery,
            subreddit: currentSubreddit,
            sort: sort === 'hot' ? 'relevance' : sort,
            timeFilter,
            after: reset ? null : afterCursor,
          })
        } else {
          result = await fetchFeed({
            subreddit: currentSubreddit,
            sort,
            timeFilter,
            after: reset ? null : afterCursor,
          })
        }

        setIsDemoMode(Boolean(result.isDemo))

        if (reset) {
          setPosts(result.posts)
        } else {
          // Append and filter duplicates
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id))
            const newPosts = result.posts.filter((p) => !existingIds.has(p.id))
            return [...prev, ...newPosts]
          })
        }

        setAfterCursor(result.after)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch Reddit posts'
        setError(message)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [currentSubreddit, sort, timeFilter, searchQuery, afterCursor]
  )

  // Fetch feed and subreddit info on parameter change
  useEffect(() => {
    loadFeed(true)

    // Load subreddit metadata if not home/popular
    fetchSubredditAbout(currentSubreddit).then((about) => {
      setSubredditAbout(about)
    })
  }, [currentSubreddit, sort, timeFilter, searchQuery])

  // Infinite scroll intersection observer
  useEffect(() => {
    if (!loadMoreRef.current || !afterCursor || loading || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && afterCursor) {
          loadFeed(false)
        }
      },
      { rootMargin: '400px' }
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [loadMoreRef, afterCursor, loading, loadingMore, loadFeed])

  // Select a new subreddit
  const handleSelectSubreddit = (sub: string) => {
    setCurrentSubreddit(sub)
    setSearchQuery(null)
    setIsMobileSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle Search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors selection:bg-[var(--accent-color)] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentSubreddit={currentSubreddit}
        onSearch={handleSearch}
        onSelectSubreddit={handleSelectSubreddit}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Demo Mode Notice Banner if live Reddit is blocked by ISP/Network */}
      {isDemoMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400 py-1.5 px-4 text-center text-xs flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>
            <strong>Demo Dataset Active:</strong> Reddit API connection is blocked by local network or rate limit. Displaying interactive sample data.
          </span>
          <button
            onClick={() => loadFeed(true)}
            className="underline font-semibold hover:opacity-80 ml-1 cursor-pointer"
          >
            Retry Live
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex gap-8 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 shrink-0 sticky top-20">
          <Sidebar
            currentSubreddit={currentSubreddit}
            onSelectSubreddit={handleSelectSubreddit}
            favorites={favorites}
            onRemoveFavorite={removeFavorite}
          />
        </div>

        {/* Mobile Drawer */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 lg:hidden backdrop-blur-xs flex"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <div
              className="w-72 bg-white dark:bg-neutral-900 h-full p-4 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                currentSubreddit={currentSubreddit}
                onSelectSubreddit={handleSelectSubreddit}
                favorites={favorites}
                onRemoveFavorite={removeFavorite}
              />
            </div>
          </div>
        )}

        {/* Central Feed Column */}
        <main className="flex-1 min-w-0">
          {/* Subreddit Header Banner & Details */}
          <FeedHeader
            subreddit={currentSubreddit}
            about={subredditAbout}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />

          {/* Search Query indicator pill */}
          {searchQuery && (
            <div className="mb-4 flex items-center justify-between p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs">
              <div>
                Showing results for <span className="font-bold">"{searchQuery}"</span>
              </div>
              <button
                onClick={() => setSearchQuery(null)}
                className="accent-text font-semibold hover:underline"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Sort Controls */}
          <SortBar
            currentSort={sort}
            onSortChange={setSort}
            currentTimeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
          />

          {/* Error State */}
          {error && (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex flex-col items-center justify-center text-center space-y-3 my-6">
              <AlertCircle className="w-8 h-8" />
              <div>
                <h4 className="font-semibold text-sm">Failed to load posts</h4>
                <p className="text-xs text-red-400 mt-1 max-w-md">{error}</p>
              </div>
              <button
                onClick={() => loadFeed(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold accent-bg text-white hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && <FeedSkeleton count={5} />}

          {/* Empty State */}
          {!loading && !error && posts.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center text-neutral-400 dark:text-neutral-500 space-y-2">
              <Layers className="w-10 h-10 opacity-40 mb-2" />
              <p className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
                No posts found
              </p>
              <p className="text-xs">There are no posts here or the query returned no results.</p>
            </div>
          )}

          {/* Posts Feed Card List */}
          {!loading && !error && posts.length > 0 && (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostClick={(p) => setSelectedPost(p)}
                  onSubredditClick={(sub) => handleSelectSubreddit(sub)}
                  onImageClick={(url) => setLightboxUrl(url)}
                />
              ))}

              {/* Infinite Scroll Trigger & Manual Load More */}
              <div ref={loadMoreRef} className="pt-6 pb-12 flex justify-center">
                {afterCursor && (
                  <button
                    onClick={() => loadFeed(false)}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <RefreshCw className="w-4 h-4 animate-spin accent-text" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    <span>{loadingMore ? 'Loading more posts...' : 'Load more posts'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Post Detail & Comments Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onImageClick={(url) => setLightboxUrl(url)}
          onSubredditClick={(sub) => handleSelectSubreddit(sub)}
        />
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        imageUrl={lightboxUrl}
        onClose={() => setLightboxUrl(null)}
      />
    </div>
  )
}

export default App
