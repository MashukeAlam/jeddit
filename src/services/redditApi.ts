import type {
  RedditListing,
  RedditPost,
  RedditComment,
  RedditMore,
  RedditSubredditAbout,
  SortType,
  TimeFilter,
  RedditThing,
} from '../types/reddit'
import { MOCK_POSTS, MOCK_COMMENTS, MOCK_SUBREDDITS } from '../data/mockRedditData'

// In development, we attempt Vite proxy or direct old.reddit.com
const isDev = import.meta.env.DEV
const BASE_URL = isDev ? '/api/reddit' : 'https://www.reddit.com'

/**
 * Universal fetch wrapper with fallback to public CORS proxies and mock data
 */
async function fetchRedditJson<T>(path: string): Promise<T> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const targetUrl = `${BASE_URL}${cleanPath}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 25000)

  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('Reddit rate limit reached. Please wait a few moments.')
      }
      if (res.status === 404) {
        throw new Error('Subreddit or post not found.')
      }
      if (res.status === 403) {
        throw new Error('Reddit blocked access (403 Forbidden).')
      }
      throw new Error(`Reddit API error: ${res.status}`)
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      const text = await res.text()
      if (text.includes('js_challenge') || text.includes('blocked by network security')) {
        throw new Error('Reddit network security challenge triggered.')
      }
      try {
        return JSON.parse(text)
      } catch {
        throw new Error('Non-JSON response received from Reddit.')
      }
    }

    return await res.json()
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    throw err
  }
}

export interface FeedResponse {
  posts: RedditPost[]
  after: string | null
  dist: number
  isDemo?: boolean
}

/**
 * Fetch a feed listing (home, popular, r/all, or specific subreddit)
 */
export async function fetchFeed({
  subreddit = 'popular',
  sort = 'hot',
  timeFilter = 'day',
  after = null,
  limit = 25,
}: {
  subreddit?: string
  sort?: SortType
  timeFilter?: TimeFilter
  after?: string | null
  limit?: number
}): Promise<FeedResponse> {
  const cleanSub = subreddit.trim().replace(/^r\//, '')
  let endpoint = ''

  if (!cleanSub || cleanSub.toLowerCase() === 'home' || cleanSub.toLowerCase() === 'popular') {
    endpoint = `/r/popular/${sort}.json`
  } else if (cleanSub.toLowerCase() === 'all') {
    endpoint = `/r/all/${sort}.json`
  } else {
    endpoint = `/r/${cleanSub}/${sort}.json`
  }

  const params = new URLSearchParams()
  params.set('limit', limit.toString())
  params.set('raw_json', '1')
  if (sort === 'top' || sort === 'controversial') {
    params.set('t', timeFilter)
  }
  if (after) {
    params.set('after', after)
  }

  const fullPath = `${endpoint}?${params.toString()}`

  try {
    const data = await fetchRedditJson<RedditListing<RedditPost>>(fullPath)

    const children: RedditThing<RedditPost>[] = data?.data?.children || []
    const posts = children
      .filter((child: RedditThing<RedditPost>) => child.kind === 't3')
      .map((child: RedditThing<RedditPost>) => child.data)

    if (posts.length > 0) {
      return {
        posts,
        after: data?.data?.after || null,
        dist: data?.data?.dist || posts.length,
        isDemo: false,
      }
    }
  } catch (err) {
    console.warn(`[Jeddit] Live Reddit request failed for ${fullPath}. Falling back to demo data:`, err)
  }

  // Graceful fallback to rich mock data
  const filtered = cleanSub && !['popular', 'all', 'home'].includes(cleanSub.toLowerCase())
    ? MOCK_POSTS.filter((p) => p.subreddit.toLowerCase() === cleanSub.toLowerCase())
    : MOCK_POSTS

  return {
    posts: filtered.length > 0 ? filtered : MOCK_POSTS,
    after: null,
    dist: filtered.length > 0 ? filtered.length : MOCK_POSTS.length,
    isDemo: true,
  }
}

export interface PostDetailResponse {
  post: RedditPost
  comments: (RedditComment | RedditMore)[]
  isDemo?: boolean
}

/**
 * Fetches post details and comment tree.
 */
export async function fetchPostDetail(permalink: string): Promise<PostDetailResponse> {
  let cleanPermalink = permalink.replace(/\/+$/, '')
  if (!cleanPermalink.endsWith('.json')) {
    cleanPermalink += '.json'
  }

  const url = `${cleanPermalink}?raw_json=1`

  try {
    const data = await fetchRedditJson<[RedditListing<RedditPost>, RedditListing<RedditComment | RedditMore>]>(url)

    if (Array.isArray(data) && data.length >= 2) {
      const post = data[0]?.data?.children?.[0]?.data
      if (post) {
        const commentChildren = data[1]?.data?.children || []
        const comments = commentChildren.map(
          (child: RedditThing<RedditComment | RedditMore>) => child.data
        )

        return {
          post,
          comments,
          isDemo: false,
        }
      }
    }
  } catch (err) {
    console.warn(`[Jeddit] Failed to load live comments for ${permalink}. Using mock comments:`, err)
  }

  // Fallback to mock comments
  const matchedPost = MOCK_POSTS.find((p) => permalink.includes(p.id)) || MOCK_POSTS[0]
  const comments = MOCK_COMMENTS[matchedPost.id] || MOCK_COMMENTS['tech_01']

  return {
    post: matchedPost,
    comments,
    isDemo: true,
  }
}

/**
 * Fetches subreddit metadata
 */
export async function fetchSubredditAbout(subreddit: string): Promise<RedditSubredditAbout | null> {
  const cleanSub = subreddit.trim().replace(/^r\//, '')
  if (!cleanSub || ['popular', 'all', 'home'].includes(cleanSub.toLowerCase())) {
    return null
  }

  try {
    const data = await fetchRedditJson<{ kind: string; data: RedditSubredditAbout }>(
      `/r/${cleanSub}/about.json?raw_json=1`
    )
    if (data?.data?.display_name) {
      return data.data
    }
  } catch {
    // Fallback to mock
  }

  return MOCK_SUBREDDITS[cleanSub] || null
}

/**
 * Searches posts
 */
export async function searchReddit({
  query,
  subreddit,
  sort = 'relevance',
  timeFilter = 'all',
  after = null,
  limit = 25,
}: {
  query: string
  subreddit?: string
  sort?: string
  timeFilter?: TimeFilter
  after?: string | null
  limit?: number
}): Promise<FeedResponse> {
  const cleanSub = subreddit?.trim().replace(/^r\//, '')
  const hasSub = cleanSub && !['popular', 'all', 'home'].includes(cleanSub.toLowerCase())

  const endpoint = hasSub ? `/r/${cleanSub}/search.json` : `/search.json`
  const params = new URLSearchParams()
  params.set('q', query)
  params.set('sort', sort)
  params.set('t', timeFilter)
  params.set('limit', limit.toString())
  params.set('raw_json', '1')
  if (hasSub) {
    params.set('restrict_sr', '1')
  }
  if (after) {
    params.set('after', after)
  }

  const fullPath = `${endpoint}?${params.toString()}`

  try {
    const data = await fetchRedditJson<RedditListing<RedditPost>>(fullPath)
    const children: RedditThing<RedditPost>[] = data?.data?.children || []
    const posts = children
      .filter((child: RedditThing<RedditPost>) => child.kind === 't3')
      .map((child: RedditThing<RedditPost>) => child.data)

    if (posts.length > 0) {
      return {
        posts,
        after: data?.data?.after || null,
        dist: data?.data?.dist || posts.length,
        isDemo: false,
      }
    }
  } catch (err) {
    console.warn(`[Jeddit] Live search failed for "${query}":`, err)
  }

  // Mock search filter
  const q = query.toLowerCase()
  const results = MOCK_POSTS.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.selftext.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q)
  )

  return {
    posts: results,
    after: null,
    dist: results.length,
    isDemo: true,
  }
}
