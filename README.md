# 🖥️ Desktop Dear

> *"A tiny computer filled with memories."*

A premium micro-SaaS where creators build magical interactive virtual desktops for someone special. Share one unique link. Let them discover a world made just for them.

## ✨ Features

### Recipient Experience
- **Boot Sequence** — Black screen → CRT power-on → BIOS text → logo → loading bar → welcome popup
- **Interactive Desktop** — Windows XP-style with kawaii Japanese sticker aesthetic
- **8 Interactive Apps** — Each opens as a draggable window:
  - 📧 **Mail** — Outlook Express style with typewriter reveal animation
  - 🎰 **Gacha Machine** — Real capsule machine with coin/handle/shake/reveal animations
  - 🎵 **Mixtape** — Cassette tape with spinning reels + Spotify embed
  - 🎟 **Invitation** — Ticket stub with countdown timer
  - ⭐ **Star Catcher** — Canvas mini game, win a star that appears on your desktop!
  - 📸 **Photo Album** — Draggable, zoomable Polaroids
  - 📅 **Calendar** — Highlighted memory date
  - 🔒 **Secret** — Password-protected folder with hidden content
- **Floating Particles** — Hearts, stars, sparkles drift upward
- **Start Menu & Taskbar** — Full XP-style with clock
- **Shutdown Sequence** — CRT screen-off + emotional farewell message
- **Sound Effects** — Web Audio API (no files needed, toggle on/off)
- **Sticky Note** — Draggable P.S. message

### Creator Dashboard
- Configure all 8 apps without touching code
- Live desktop preview
- Custom wallpaper themes (6 presets)
- Custom URL slugs
- Publish & copy share link

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000
```

### Pages
| URL | Description |
|-----|-------------|
| `/` | Marketing landing page |
| `/d/demo` | Demo desktop experience (try it!) |
| `/d/[your-slug]` | Recipient's desktop |
| `/create` | Creator dashboard |

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS + Custom CSS |
| Animation | Framer Motion |
| State | Zustand (with localStorage persistence) |
| Audio | Web Audio API (programmatic, no files) |
| Fonts | VT323, Nunito, Caveat (Google Fonts) |
| Deploy | Vercel |

## 🔧 Environment Setup

1. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.local.example .env.local
   ```
2. Open your [Supabase Dashboard](https://supabase.com), go to your project's **SQL Editor**, and run the SQL instructions located in [SUPABASE_SCHEMA.sql](file:///Users/hemantdaruricloud.com/Documents/microsaas/SUPABASE_SCHEMA.sql).
3. Restart the dev server. Desktop creations will now be persisted to your Supabase database and retrieved dynamically!

The demo at `/d/demo` works out-of-the-box even without any environment variables.

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── create/page.tsx       # Creator dashboard
│   ├── d/[slug]/             # Recipient desktop
│   └── actions.ts            # Supabase Server Actions
├── components/
│   ├── boot/                 # Boot sequence animation
│   ├── desktop/              # Desktop, Window, Taskbar, etc.
│   └── apps/                 # All 8 app components
├── stores/                   # Zustand state management
├── hooks/                    # useSound hook
└── lib/                      # Types, demo data, Supabase client
```

## 🎨 Design System

- **Colors**: Soft teal (#4EBFBF) desktop + pastel pink accents
- **XP Chrome**: Blue titlebar gradients, silver chrome
- **Fonts**: VT323 (pixel), Nunito (body), Caveat (handwritten)
- **Animations**: Spring physics throughout via Framer Motion

## 🗺 Roadmap

- [x] Supabase database integration
- [ ] Creator auth (Supabase Auth)
- [ ] Cloudinary photo uploads
- [ ] Voice note recording
- [ ] Mobile pinch-to-zoom
- [ ] Premium themes
- [ ] Stripe payments
- [ ] Analytics dashboard

---

Made with ❤️ by Desktop Dear

