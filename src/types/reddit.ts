export interface RedditThing<T> {
  kind: string
  data: T
}

export interface RedditListingData<T> {
  modhash: string
  dist: number
  after: string | null
  before: string | null
  children: RedditThing<T>[]
}

export interface RedditListing<T> {
  kind: 'Listing'
  data: RedditListingData<T>
}

export interface RedditImageSource {
  url: string
  width: number
  height: number
}

export interface RedditGalleryItem {
  status: string
  e: string
  m: string
  p?: Array<{ y: number; x: number; u: string }>
  s?: { y: number; x: number; u?: string; gif?: string }
}

export interface RedditVideoData {
  fallback_url: string
  hls_url: string
  dash_url: string
  height: number
  width: number
  is_gif: boolean
  duration?: number
}

export interface RedditPost {
  id: string
  name: string // "t3_..."
  title: string
  author: string
  subreddit: string
  subreddit_name_prefixed: string
  subreddit_id: string
  score: number
  upvote_ratio: number
  num_comments: number
  created_utc: number
  permalink: string
  url: string
  domain: string
  is_self: boolean
  selftext: string
  selftext_html: string | null
  over_18: boolean
  spoiler: boolean
  stickied: boolean
  pinned?: boolean
  locked: boolean
  link_flair_text: string | null
  link_flair_background_color: string | null
  link_flair_text_color: 'dark' | 'light' | null
  distinguished: 'moderator' | 'admin' | null
  post_hint?: 'image' | 'hosted:video' | 'rich:video' | 'link' | string
  is_video: boolean
  is_gallery?: boolean
  media?: {
    reddit_video?: RedditVideoData
    oembed?: {
      provider_name: string
      title?: string
      html?: string
      thumbnail_url?: string
    }
  } | null
  secure_media?: {
    reddit_video?: RedditVideoData
  } | null
  gallery_data?: {
    items: Array<{
      media_id: string
      id: number
      caption?: string
    }>
  }
  media_metadata?: Record<string, RedditGalleryItem>
  preview?: {
    images: Array<{
      source: RedditImageSource
      resolutions: RedditImageSource[]
    }>
    reddit_video_preview?: RedditVideoData
  }
  crosspost_parent_list?: RedditPost[]
}

export interface RedditComment {
  id: string
  name: string // "t1_..."
  parent_id: string
  link_id: string
  author: string
  body: string
  body_html?: string
  score: number
  score_hidden?: boolean
  created_utc: number
  distinguished: 'moderator' | 'admin' | null
  is_submitter: boolean // OP indicator
  stickied: boolean
  replies: RedditListing<RedditComment | RedditMore> | '' | null
  depth?: number
  collapsed?: boolean
}

export interface RedditMore {
  count: number
  name: string
  id: string
  parent_id: string
  children: string[]
  depth?: number
}

export interface RedditSubredditAbout {
  display_name: string
  display_name_prefixed: string
  title: string
  public_description: string
  description?: string
  subscribers: number
  active_user_count?: number
  icon_img: string
  community_icon: string
  banner_background_image: string
  banner_img: string
  primary_color: string
  key_color: string
  over18: boolean
  created_utc: number
}

export type SortType = 'hot' | 'new' | 'top' | 'rising' | 'controversial'
export type TimeFilter = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
