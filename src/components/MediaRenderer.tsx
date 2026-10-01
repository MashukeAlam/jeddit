import React, { useState, useEffect, useRef } from 'react'
import Hls from 'hls.js'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import type { RedditPost } from '../types/reddit'
import { getPostMedia, decodeHtmlEntities } from '../utils/helpers'

interface MediaRendererProps {
  post: RedditPost
  isDetailView?: boolean
  onImageClick?: (url: string) => void
}

export const MediaRenderer: React.FC<MediaRendererProps> = ({
  post,
  isDetailView = false,
  onImageClick,
}) => {
  const media = getPostMedia(post)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [showSensitive, setShowSensitive] = useState(!post.over_18 && !post.spoiler)
  const [isTextExpanded, setIsTextExpanded] = useState(isDetailView)
  const [isMuted, setIsMuted] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  // Setup HLS for Reddit Video
  useEffect(() => {
    if (media.type !== 'reddit_video' || !media.video || !videoRef.current) return

    const video = videoRef.current
    const hlsUrl = media.video.hlsUrl

    if (Hls.isSupported() && hlsUrl) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      })
      hls.loadSource(hlsUrl)
      hls.attachMedia(video)
      hlsRef.current = hls

      return () => {
        hls.destroy()
        hlsRef.current = null
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && hlsUrl) {
      // Native Safari HLS support
      video.src = hlsUrl
    } else if (media.video.fallbackUrl) {
      // Fallback direct MP4 (no audio)
      video.src = media.video.fallbackUrl
    }
  }, [media.type, media.video])

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  // Wrapper for sensitive blur
  const wrapSensitive = (content: React.ReactNode) => {
    if (showSensitive) return content

    return (
      <div className="relative overflow-hidden rounded-xl bg-neutral-900/10 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 p-8 flex flex-col items-center justify-center text-center my-3">
        <div className="filter blur-xl pointer-events-none select-none absolute inset-0 opacity-40">
          {content}
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
            <EyeOff className="w-3.5 h-3.5" />
            {post.over_18 ? 'NSFW Content' : 'Spoiler'}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Click below to unhide this media
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowSensitive(true)
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
          >
            Show Content
          </button>
        </div>
      </div>
    )
  }

  // 1. Single Direct Image
  if (media.type === 'image' && media.imageUrl) {
    return wrapSensitive(
      <div className="relative my-3 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800/80 group flex items-center justify-center max-h-[600px]">
        <img
          src={media.imageUrl}
          alt={post.title}
          loading="lazy"
          className="w-full h-auto max-h-[600px] object-contain cursor-zoom-in transition-transform duration-300"
          onClick={(e) => {
            e.stopPropagation()
            onImageClick?.(media.imageUrl!)
          }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation()
            onImageClick?.(media.imageUrl!)
          }}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          title="View full image"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // 2. Reddit Gallery
  if (media.type === 'gallery' && media.galleryItems && media.galleryItems.length > 0) {
    const currentItem = media.galleryItems[galleryIndex]
    return wrapSensitive(
      <div className="relative my-3 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800/80 group flex flex-col items-center justify-center max-h-[600px]">
        <div className="relative w-full flex items-center justify-center max-h-[550px] overflow-hidden">
          <img
            src={currentItem.url}
            alt={currentItem.caption || `Image ${galleryIndex + 1}`}
            className="w-full h-auto max-h-[550px] object-contain cursor-zoom-in"
            onClick={(e) => {
              e.stopPropagation()
              onImageClick?.(currentItem.url)
            }}
          />

          {/* Navigation Arrows */}
          {media.galleryItems.length > 1 && (
            <>
              {galleryIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setGalleryIndex((prev) => prev - 1)
                  }}
                  className="absolute left-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {galleryIndex < media.galleryItems.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setGalleryIndex((prev) => prev + 1)
                  }}
                  className="absolute right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </>
          )}

          {/* Gallery Counter Badge */}
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs font-medium">
            {galleryIndex + 1} / {media.galleryItems.length}
          </div>
        </div>

        {currentItem.caption && (
          <div className="w-full p-2.5 text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-200/40 dark:bg-neutral-800/40 border-t border-neutral-200 dark:border-neutral-800">
            {currentItem.caption}
          </div>
        )}
      </div>
    )
  }

  // 3. Reddit Video (v.redd.it with HLS)
  if (media.type === 'reddit_video' && media.video) {
    return wrapSensitive(
      <div className="relative my-3 rounded-xl overflow-hidden bg-black border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-center max-h-[580px] group">
        <video
          ref={videoRef}
          controls
          muted={isMuted}
          playsInline
          loop
          className="w-full h-auto max-h-[580px] object-contain"
        />

        {!media.video.isGif && (
          <button
            onClick={toggleMute}
            className="absolute bottom-16 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors z-20"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
      </div>
    )
  }

  // 4. YouTube Embed
  if (media.type === 'youtube' && media.youtubeId) {
    return (
      <div className="relative my-3 rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800/80 aspect-video bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${media.youtubeId}`}
          title={post.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    )
  }

  // 5. External Link Preview Card
  if (media.type === 'external_link' && media.externalLink) {
    const { url, domain, thumbnail, title } = media.externalLink
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="my-3 flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl border border-neutral-200/90 dark:border-neutral-800/90 bg-neutral-50 dark:bg-neutral-900/40 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors group"
      >
        {thumbnail && (
          <div className="w-full sm:w-28 h-24 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800">
            <img
              src={thumbnail}
              alt={title || domain}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 min-w-0 py-1 w-full">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 mb-1">
            <span className="font-medium text-neutral-600 dark:text-neutral-400">{domain}</span>
            <ExternalLink className="w-3 h-3 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200 transition-colors" />
          </div>
          <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 group-hover:underline">
            {title || url}
          </h4>
        </div>
      </a>
    )
  }

  // 6. Self-post Markdown Text
  if (post.selftext && post.selftext.trim()) {
    const rawMarkdown = decodeHtmlEntities(post.selftext)
    const isLongText = rawMarkdown.length > 400 && !isDetailView

    return (
      <div className="my-2 text-neutral-800 dark:text-neutral-200 text-sm leading-relaxed">
        <div
          className={`prose-jeddit ${
            isLongText && !isTextExpanded ? 'max-h-48 overflow-hidden relative' : ''
          }`}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{rawMarkdown}</ReactMarkdown>

          {isLongText && !isTextExpanded && (
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent pointer-events-none" />
          )}
        </div>

        {isLongText && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsTextExpanded(!isTextExpanded)
            }}
            className="mt-2 text-xs font-medium accent-text hover:underline"
          >
            {isTextExpanded ? 'Show less' : 'Read more...'}
          </button>
        )}
      </div>
    )
  }

  return null
}
