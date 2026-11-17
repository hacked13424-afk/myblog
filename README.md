# Blog & Articles Platform (Next.js + PostgreSQL)

Full-width fluid blog with Blogs / Articles, rich-media editor, hidden admin panel and AdSense slots.

## Stack
Next.js App Router · React · TypeScript · Tailwind CSS v4 · Framer Motion · Drizzle ORM · PostgreSQL (Supabase / Neon / any) · Tiptap editor · jose (JWT) · bcryptjs

## Setup
1. `cp .env.example .env` and fill in `DATABASE_URL`, `JWT_SECRET`, (optional) `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
2. `npm install`
3. `npx drizzle-kit push` (creates the tables)
4. `npm run build && npm start`  (or `npm run dev`)

## Hidden admin
Open `https://yourdomain.com/admin` by typing the URL (no public links exist). On first sign-in the account from
`ADMIN_USERNAME` / `ADMIN_PASSWORD` is created (defaults: `admin` / `admin123`) – **change it immediately** under
*Admin → Credentials*.

## Structure
```
src/
  db/schema.ts               posts (type: blog|article), messages, settings (key/value), admins, media
  lib/                       auth (JWT cookie), settings, posts queries, seed, utils, defaults (legal text)
  app/
    actions.ts               server actions (login, posts CRUD, settings, credentials, messages, contact form)
    (site)/                  public pages: home, blogs, articles, [slug], search, about, contact, legal
    admin/login              login screen
    admin/(panel)/           dashboard, posts, pages, messages, ads, settings, credentials
    api/upload, api/media    media upload (stored in Postgres) + streaming with Range support
    sitemap.ts, robots.ts    dynamic SEO files
  components/                Header, Footer, PostCard, Sidebar, AdSlot, admin/RichEditor …
```

## AdSense
Admin → AdSense: head script, header banner, in-article (auto-injected mid-content), sticky sidebar, footer.
