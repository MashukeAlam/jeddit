import fs from 'node:fs'
import puppeteer, { Browser, Page } from 'puppeteer'

// Find suitable Chromium binary on the system
function getExecutablePath(): string | undefined {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ]

  for (const p of candidates) {
    if (p && fs.existsSync(p)) {
      return p
    }
  }
  return undefined // let Puppeteer use default
}

interface CacheItem {
  data: unknown
  expires: number
}

class RedditPuppeteerManager {
  private browser: Browser | null = null
  private page: Page | null = null
  private isInitializing = false
  private initPromise: Promise<Page> | null = null
  private cache = new Map<string, CacheItem>()

  async initSession(): Promise<Page> {
    if (this.page && !this.page.isClosed()) {
      return this.page
    }

    if (this.isInitializing && this.initPromise) {
      return this.initPromise
    }

    this.isInitializing = true
    this.initPromise = (async () => {
      console.log('[Puppeteer] Launching simulated browser session...')
      const executablePath = getExecutablePath()

      this.browser = await puppeteer.launch({
        headless: true,
        executablePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--window-size=1920,1080',
          '--disable-dev-shm-usage',
        ],
        ignoreDefaultArgs: ['--enable-automation'],
      })

      const page = await this.browser.newPage()
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
        // @ts-expect-error chrome mock
        window.chrome = { runtime: {} }
      })

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
      )
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
      })

      console.log('[Puppeteer] Visiting Reddit to solve challenges and acquire session cookies...')
      await page.goto('https://www.reddit.com/r/technology', {
        waitUntil: 'networkidle2',
        timeout: 35000,
      })

      console.log('[Puppeteer] Session established successfully at:', page.url())
      this.page = page
      this.isInitializing = false
      return page
    })()

    return this.initPromise
  }

  async fetchJson<T = unknown>(rawPath: string): Promise<T> {
    // 1. Check in-memory cache (TTL: 60s)
    const cached = this.cache.get(rawPath)
    if (cached && Date.now() < cached.expires) {
      return cached.data as T
    }

    const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    const fullTargetUrl = `https://www.reddit.com${cleanPath}`

    let page = await this.initSession()

    try {
      const result = await page.evaluate(async (url: string) => {
        try {
          const res = await fetch(url, {
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
            },
          })
          const text = await res.text()
          return {
            status: res.status,
            contentType: res.headers.get('content-type') || '',
            text,
            error: null as string | null,
          }
        } catch (err: unknown) {
          return {
            status: 0,
            contentType: '',
            text: '',
            error: err instanceof Error ? err.message : String(err),
          }
        }
      }, fullTargetUrl)

      if (result.error) {
        throw new Error(result.error)
      }

      const trimmed = result.text.trim()
      if (result.status === 200 && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
        const parsed = JSON.parse(result.text) as T
        this.cache.set(rawPath, { data: parsed, expires: Date.now() + 60_000 })
        return parsed
      } else {
        console.warn(`[Puppeteer] Unexpected status ${result.status} for ${fullTargetUrl}:`, result.text.slice(0, 150))
        if (result.status === 403) {
          console.log('[Puppeteer] Re-establishing session due to 403...')
          this.page = null
          page = await this.initSession()
        }
        throw new Error(`Reddit returned status ${result.status}`)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('Execution context was destroyed')) {
        console.log('[Puppeteer] Context destroyed, re-initializing session...')
        this.page = null
        page = await this.initSession()
        const retryResult = await page.evaluate(async (url: string) => {
          const res = await fetch(url, { credentials: 'include', headers: { 'Accept': 'application/json' } })
          return await res.json()
        }, fullTargetUrl)
        this.cache.set(rawPath, { data: retryResult, expires: Date.now() + 60_000 })
        return retryResult as T
      }
      throw err
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.page = null
    }
  }
}

export const puppeteerManager = new RedditPuppeteerManager()
