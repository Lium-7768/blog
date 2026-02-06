import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { z } from 'zod'

// Validation schemas
const createTagSchema = z.object({
  name: z.string().min(1).max(50).trim(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#3B82F6'),
})

/**
 * Generate URL-friendly slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .substring(0, 50)         // Limit length
}

/**
 * GET /api/tags
 * List all tags with post counts
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient()

    // Get all tags with post count
    const { data: tags, error } = await supabaseAdmin
      .from('tags')
      .select(`
        id, name, slug, color, created_at,
        post_tags(count)
      `)
      .order('name')

    if (error) {
      console.error('Get tags error:', error)
      return NextResponse.json(
        { error: 'Failed to get tags' },
        { status: 500 }
      )
    }

    // Format post_count from array to number
    const formattedTags = tags?.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      color: tag.color,
      created_at: tag.created_at,
      post_count: tag.post_tags?.[0]?.count || 0,
    })) || []

    return NextResponse.json({ tags: formattedTags })
  } catch (error: any) {
    console.error('Get tags error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tags
 * Create new tag (authenticated users)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // 2. Validate request body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const validation = createTagSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid tag data',
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { name, color } = validation.data
    const slug = generateSlug(name)

    // 3. Validate slug is not empty
    if (!slug) {
      return NextResponse.json(
        { error: 'Invalid tag name - could not generate slug' },
        { status: 400 }
      )
    }

    // 4. Create tag using admin client
    const supabaseAdmin = getAdminClient()

    const { data: tag, error } = await (supabaseAdmin
      .from('tags') as any)
      .insert({ name, slug, color })
      .select('id, name, slug, color, created_at')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Tag already exists' },
          { status: 409 }
        )
      }
      console.error('Create tag error:', error)
      return NextResponse.json(
        { error: 'Failed to create tag' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tag }, { status: 201 })
  } catch (error: any) {
    console.error('Create tag error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}