---
name: reddit-marketing-advisor
description: >-
  Expert advisor for discovering high-intent subreddits, auditing community moderation rules,
  and crafting organic, developer-friendly Reddit posts that generate genuine traction without
  triggering spam filters or moderator bans. Use whenever the user wants to promote an app,
  tool, library, or side project on Reddit, find target subreddits, or optimize post copy/video demos.
---

# Reddit Launch & Organic Marketing Advisor

This skill guides the agent in discovering relevant communities, analyzing subreddit rules, studying top-performing maker submissions, and writing natural, non-promotional Reddit posts (titles, body copy, media recommendations, and first-comment scripts) that stay approved by moderators.

---

## 🎯 Core Operating Principles

1. **The Builder's Posture ("Scratching My Own Itch"):**
   Redditors reject slick marketing, buzzwords, and commercial sales pitches, but enthusiastically support independent builders who share how they solved a personal problem or technical challenge.
2. **The 9:1 Value Rule:**
   Never post a bare link or pure ad. Provide 90% technical or practical value (architecture, lessons learned, free utilities, open source code) and 10% product showcase.
3. **Respect Subreddit Windows & Flairs:**
   Communities like `r/webdev` strictly restrict self-promotion to dedicated days (e.g., *Showoff Saturday* with `[Showoff Saturday]` flair). Violating timing rules causes instant removal.
4. **Visual Proof Over Claims:**
   Native video uploads (`.mp4`) that autoplay in the Reddit feed achieve 3x–5x more upvotes and engagement than static links or YouTube embeds.

---

## 📋 Step-by-Step Procedure

### Step 1: Profile the App & Core Value Hook
Extract or clarify the following key attributes from the user:
- **App Name & Pitch:** What does it do in 1 sentence?
- **Pain Point:** What frustration or limitation of existing tools prompted building it?
- **Technical Hooks:** Interesting tech stack choices (e.g., React 19, HLS video streams, Rust/Wasm, local caching, Puppeteer edge proxy).
- **Offer Type:** Open source, free web tool, freemium, self-hosted, or paid SaaS.
- **Repository / Demo URL:** Is there a public GitHub repo or zero-friction live web demo?

### Step 2: Subreddit Discovery & Categorization
Match the application with appropriate subreddits across these 4 tiers:
1. **Tier 1: General Maker & Side Project Communities**
   - `r/SideProject` (Side projects, builders, early adopters)
   - `r/IndieHackers` (Bootstrapped software, maker journey)
   - `r/roastmystartup` (Honest product teardowns and feedback)
2. **Tier 2: Tech Stack Specific Communities**
   - E.g., `r/webdev` (*Showoff Saturday* only), `r/reactjs` (*Show React* discussions), `r/frontend`, `r/javascript`, `r/Python`, `r/rust`.
3. **Tier 3: Problem / Philosophy-Specific Communities**
   - E.g., for ad-free/privacy tools: `r/privacy`, `r/opensource`, `r/selfhosted`, `r/degoogle`.
   - E.g., for productivity/notes: `r/productivity`, `r/PKMS`, `r/Notion`.
4. **Tier 4: Broad Utility & Discovery Communities**
   - `r/InternetIsBeautiful` (Unique single-purpose websites, zero paywall/signup).

*Consult [subreddit_directory.md](./references/subreddit_directory.md) for full community profiles and specific rules.*

### Step 3: Moderation & Rule Audit
Before suggesting any post, verify the target subreddit's rules:
- **Dedicated Days:** Is self-promotion restricted to a specific day (e.g., Saturday on `r/webdev`)?
- **Post Types Allowed:** Does the sub allow link posts, native video uploads, or strictly text posts?
- **Account Requirements:** Does AutoModerator enforce minimum karma (e.g., >50–100) or account age (>30 days)?
- **Link Policy:** Are external URLs permitted in the post body, or only in author comments?

### Step 4: Media Strategy (Video vs. Image vs. Text)
- **Native Video Upload (`.mp4`)**: Default recommendation for visual, frontend, or UI/UX apps.
  - Duration: 20–35 seconds maximum.
  - Action-packed: Feed scrolling, smooth animations, key differentiator action, dark/light theme toggle.
  - No corporate voiceover; lo-fi background music or ambient silence.
  - Refer to [video_storyboard_guide.md](./references/video_storyboard_guide.md) for filming specifications.
- **Side-by-Side Image / Carousel**: Best for tools with clear "Before vs. After" transformations or comparison tables.
- **Text Post (Deep Dive)**: Best for complex technical architecture, performance benchmarks, or post-mortems (`r/reactjs`, `r/programming`).

### Step 5: Draft Titles & Post Content
Generate 3 title variations targeting different angles:
1. **The Frustrated User Angle:** *"I got tired of [Pain Point] with [Big Competitor], so I spent the last few weeks building [App Name] [Tech Stack]"*
2. **The Technical Innovation Angle:** *"How I built [App Name] with [Tech Stack]: Solving [Specific Engineering Challenge]"*
3. **The Open-Source / Community Angle:** *"I open-sourced [App Name]: A minimalist, ad-free alternative to [Mainstream App]"*

*Review [title_formulas.md](./references/title_formulas.md) for battle-tested headline templates.*

### Step 6: Formulate the "Golden First Comment"
When submitting a video post, provide the exact comment the creator should paste **within 60 seconds** of posting:
- Origin story (why I built this in 2 sentences)
- Tech stack highlights
- What problems were solved
- Links (GitHub / Live Demo)
- Clear feedback question (*"What features or improvements would make this part of your daily workflow?"*)

### Step 7: Launch Execution Checklist
Provide the user with operational advice:
- **Optimal Posting Times:** Tuesday–Thursday between 7:00 AM – 9:00 AM EST (12:00 PM – 2:00 PM UTC) for global reach; Saturday mornings for `r/webdev`.
- **First 2 Hours Protocol:** Reply to every commenter promptly. Upvote all constructive feedback. Never become defensive when criticized.
- **Post-Mortem & Follow-up:** Track which subreddit drove the highest engagement and incorporate community feedback into the next iteration.
