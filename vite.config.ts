import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { puppeteerManager } from './server/puppeteerService.ts'

function puppeteerRedditPlugin(): Plugin {
  return {
    name: 'vite-plugin-puppeteer-reddit',
    configureServer(server) {
      server.middlewares.use('/api/reddit', async (req, res) => {
        const rawPath = req.url || '/'
        console.log(`[Vite Puppeteer Proxy] Incoming request: ${rawPath}`)

        try {
          const data = await puppeteerManager.fetchJson(rawPath)
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify(data))
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err)
          console.error(`[Vite Puppeteer Proxy] Error fetching ${rawPath}:`, message)
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: message }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), puppeteerRedditPlugin()],
})
