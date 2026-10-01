import http from 'node:http'
import { puppeteerManager } from './puppeteerService.js'

const PORT = process.env.PORT || 3001

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  const url = req.url || '/'
  console.log(`[Puppeteer Server] Incoming: ${url}`)

  try {
    const rawPath = url.replace(/^\/api\/reddit/, '')
    const data = await puppeteerManager.fetchJson(rawPath)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.end(JSON.stringify(data))
  } catch (err) {
    console.error(`[Puppeteer Server] Error handling ${url}:`, err.message)
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: err.message }))
  }
})

server.listen(PORT, () => {
  console.log(`[Puppeteer Server] Running at http://localhost:${PORT}`)
})

process.on('SIGINT', async () => {
  console.log('Shutting down Puppeteer...')
  await puppeteerManager.close()
  process.exit(0)
})
