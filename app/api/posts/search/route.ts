import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { z } from 'zod'

// Rate limiting - simple in-memory store (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 30 // 30 requests per minute

// Validation schema
const searchSchema = z.object({
  q: z.string().min(1).max(100).trim(),
})

/**
 * Check rate limit for IP
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    // Reset window
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false
  }

  record.count++
  return true
}

/**
 * Sanitize search query to prevent SQL injection patterns
 */
function sanitizeQuery(query: string): string {
  // Remove special SQL characters that could be used for injection
  // Supabase/PostgREST handles actual SQL injection, this is extra safety
  return query
    .replace(/[%_\\]/g, '\\$&') // Escape wildcards
    .substring(0, 100) // Limit length
}

/**
 * GET /api/posts/search?q={query}
 * Search posts by title, content, excerpt
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Rate limiting
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // 2. Parse and validate query
    const { searchParams } = new URL(request.url)
    const rawQuery = searchParams.get('q')

    const validation = searchSchema.safeParse({ q: rawQuery })
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid search query',
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    const query = sanitizeQuery(validation.data.q)

    // 3. Use admin client for search (bypasses RLS for better performance)
    const supabaseAdmin = getAdminClient()

    // 4. Search in title, content, and excerpt
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select('id, title, slug, excerpt, created_at, author:profiles(name), category:categories(name, slug)')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      posts: posts || [],
      query: validation.data.q,
      count: posts?.length || 0,
    })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}