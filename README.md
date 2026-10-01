# Jeddit 🚀

A modern, distraction-free, minimalist Reddit frontend built with **Vite**, **React 19**, **TypeScript**, and **Tailwind CSS**.

---

## ✨ Features

- **Clean Card View**: Spacious cards with subtle borders, vote score pill counters, flairs, relative timestamps, and tactile feedback.
- **Selectable Accent Colors**: Switch between 7 distinct color accents (*Reddit Flame, Neon Violet, Ocean Cyan, Emerald, Rose Pink, Amber Gold, and Slate*) with live CSS variable injection and `localStorage` persistence.
- **Dark & Light Mode**: Seamless dark mode tailored for reading discussions.
- **Rich Media Renderer**:
  - **Self-posts**: Markdown rendering with syntax highlighting, lists, and quote blocks (`react-markdown` + `remark-gfm`).
  - **Single Images**: Click-to-zoom full-screen lightbox modal.
  - **Galleries**: Multi-image carousel with previous/next controls and image count badges.
  - **Reddit Videos (`v.redd.it`)**: Synchronized video and audio playback using **Hls.js** to solve Reddit's split audio/video stream challenge.
  - **External Links**: Clean preview cards with publisher domain and thumbnail.
  - **NSFW & Spoilers**: Protective blur overlay with "Show content" click-to-reveal toggle.
- **Deep Recursive Comments**:
  - Colored indentation threading lines for visual hierarchy.
  - Branch collapsing (`[+] N collapsed]`).
  - `[OP]` submitter tag, moderator shield badge, and stickied comment pins.
  - Bulletproof safety guarding against Reddit's infamous `replies: ""` empty string gotcha.
- **Subreddit Explorer & Sidebar**:
  - Subreddit banner, icon, description, subscriber count, and online users count from `about.json`.
  - Curated categories (*Technology, Science, Discussions, Visual, Gaming*).
  - Quick subreddit jump input (`r/...`).
  - Bookmark & save favorite communities in `localStorage`.
- **Feed Sorting & Search**:
  - Sort by **Hot**, **New**, **Top** (Today, Week, Month, Year, All Time), and **Rising**.
  - Search within a subreddit or across all of Reddit.
  - Infinite scroll with IntersectionObserver.

---

## 🛠️ Tech Stack

- **Framework**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Markdown**: `react-markdown`, `remark-gfm`
- **Video Streaming**: `hls.js`

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start the development server
```bash
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 📡 Reddit JSON API & Puppeteer Browser Simulation

Reddit's modern edge security blocks datacenter IPs and direct unauthenticated cURL/fetch scripts with HTTP 403 / JavaScript challenges (`js_challenge`).

To overcome this seamlessly, **Jeddit incorporates a headless Puppeteer browser engine**:
- **Simulated Browser Session**: Puppeteer launches a stealth Chromium session, solves initial JS/cookie challenges, and retains Reddit session cookies.
- **In-Page JSON Evaluator**: Routes `/api/reddit/*` requests through the warm browser context to retrieve authentic, real-time Reddit `.json` data.
- **In-Memory Cache (TTL: 60s)**: High-speed local caching delivers sub-100ms response times for visited feeds and comments.
- **Single Command Startup**: The Puppeteer proxy is embedded directly into the Vite dev server (`vite.config.ts`), so running `npm run dev` handles everything in one process.
- **Offline / Network Fallback**: If Reddit ever goes down or network disconnects, Jeddit gracefully transitions to rich demo snapshots without breaking the UI.
