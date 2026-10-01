import type { RedditPost } from '../types/reddit'

/**
 * Decodes HTML entities commonly returned by Reddit JSON API (like &amp; &lt; &gt;)
 */
export function decodeHtmlEntities(input?: string): string {
  if (!input) return ''
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

/**
 * Formats large score / subscriber numbers cleanly (e.g. 1.4k, 32.5k, 2.1M)
 */
export function formatNumber(num: number): string {
  if (num === undefined || num === null) return '0'
  const abs = Math.abs(num)
  const sign = num < 0 ? '-' : ''

  if (abs >= 1_000_000) {
    return sign + (abs / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (abs >= 1_000) {
    return sign + (abs / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return sign + abs.toString()
}

/**
 * Formats Unix UTC seconds into human-readable relative time (e.g. 2h ago, 5d ago)
 */
export function formatTimeAgo(utcSeconds: number): string {
  if (!utcSeconds) return ''
  const now = Math.floor(Date.now() / 1000)
  const diff = Math.max(0, now - utcSeconds)

  if (diff < 60) return 'just now'
  const minutes = Math.floor(diff / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  const years = Math.floor(months / 12)
  return `${years}y ago`
}

export interface ExtractedMedia {
  type: 'image' | 'gallery' | 'reddit_video' | 'youtube' | 'external_link' | 'text' | 'none'
  imageUrl?: string
  galleryItems?: Array<{ url: string; caption?: string; width?: number; height?: number }>
  video?: {
    hlsUrl: string
    fallbackUrl: string
    height: number
    width: number
    isGif: boolean
  }
  externalLink?: {
    url: string
    domain: string
    thumbnail?: string
    title?: string
  }
  youtubeId?: string
}

/**
 * Extracts and normalizes media from a Reddit post object
 */
export function getPostMedia(post: RedditPost): ExtractedMedia {
  // 1. Crosspost support: if this is a crosspost and has parent, we check parent media
  const targetPost = post.crosspost_parent_list?.[0] || post

  // 2. Reddit Video (v.redd.it)
  const redditVideo = targetPost.media?.reddit_video || targetPost.secure_media?.reddit_video || targetPost.preview?.reddit_video_preview
  if (redditVideo) {
    return {
      type: 'reddit_video',
      video: {
        hlsUrl: decodeHtmlEntities(redditVideo.hls_url),
        fallbackUrl: decodeHtmlEntities(redditVideo.fallback_url),
        height: redditVideo.height,
        width: redditVideo.width,
        isGif: Boolean(redditVideo.is_gif),
      },
    }
  }

  // 3. YouTube Embed check
  const youtubeMatch = targetPost.url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
  if (youtubeMatch) {
    return {
      type: 'youtube',
      youtubeId: youtubeMatch[1],
      externalLink: {
        url: targetPost.url,
        domain: targetPost.domain,
        title: targetPost.title,
        thumbnail: `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`,
      },
    }
  }

  // 4. Reddit Gallery
  if (targetPost.is_gallery && targetPost.gallery_data?.items && targetPost.media_metadata) {
    const galleryItems: Array<{ url: string; caption?: string; width?: number; height?: number }> = []

    for (const item of targetPost.gallery_data.items) {
      const meta = targetPost.media_metadata[item.media_id]
      if (meta && meta.status === 'valid') {
        const url = meta.s?.gif || meta.s?.u
        if (url) {
          galleryItems.push({
            url: decodeHtmlEntities(url),
            caption: item.caption,
            width: meta.s?.x,
            height: meta.s?.y,
          })
        }
      }
    }

    if (galleryItems.length > 0) {
      return {
        type: 'gallery',
        galleryItems,
      }
    }
  }

  // 5. Single Direct Image (i.redd.it, imgur, or post_hint: image)
  const isDirectImage =
    targetPost.post_hint === 'image' ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(targetPost.url) ||
    targetPost.domain === 'i.redd.it'

  if (isDirectImage && targetPost.url) {
    return {
      type: 'image',
      imageUrl: decodeHtmlEntities(targetPost.url),
    }
  }

  // 6. Image Preview from preview.images
  if (targetPost.preview?.images?.[0]?.source?.url) {
    const previewUrl = decodeHtmlEntities(targetPost.preview.images[0].source.url)
    // If not a self-post and has preview, it can either be treated as image or rich link
    if (targetPost.post_hint === 'link' || !targetPost.is_self) {
      return {
        type: 'external_link',
        externalLink: {
          url: targetPost.url,
          domain: targetPost.domain,
          thumbnail: previewUrl,
          title: targetPost.title,
        },
      }
    }
    return {
      type: 'image',
      imageUrl: previewUrl,
    }
  }

  // 7. External Link without rich preview
  if (!targetPost.is_self && targetPost.url && targetPost.domain !== `self.${targetPost.subreddit}`) {
    return {
      type: 'external_link',
      externalLink: {
        url: targetPost.url,
        domain: targetPost.domain,
        title: targetPost.title,
      },
    }
  }

  // 8. Self-post with text
  if (targetPost.is_self && targetPost.selftext?.trim()) {
    return {
      type: 'text',
    }
  }

  return { type: 'none' }
}
