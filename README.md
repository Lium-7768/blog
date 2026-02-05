# Blog - Next.js + Supabase

A modern blog built with Next.js and Supabase.

## Features

- ⚡ Next.js App Router
- 💾 Supabase Database & Auth
- 🎨 Tailwind CSS
- 🚀 Deployed on Vercel

## Getting Started

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the project URL and anon key

### 2. Setup Environment Variables

```bash
cp .env.example .env.local
```

Add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Locally

```bash
npm install
npm run dev
```

### 4. Deploy to Vercel

```bash
vercel
```

Or deploy via [Vercel Dashboard](https://vercel.com/new).

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Database:** [Supabase](https://supabase.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Deployment:** [Vercel](https://vercel.com/)