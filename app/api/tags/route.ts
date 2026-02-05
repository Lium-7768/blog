import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/tags - List all tags with post counts
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get all tags with post count
    const { data: tags, error } = await supabase
      .from('tags')
      .select(`
        *,
        post_count:post_tags(count)
      `)
      .order('name')

    if (error) {
      throw error
    }

    // Format post_count from array to number
    const formattedTags = tags?.map((tag: any) => ({
      ...tag,
      post_count: tag.post_count?.[0]?.count || 0
    })) || []

    return NextResponse.json({ tags: formattedTags })
  } catch (error: any) {
    console.error('Get tags error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get tags' },
      { status: 500 }
    )
  }
}

// POST /api/tags - Create new tag (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check auth
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, color = '#3B82F6' } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)

    const { data: tag, error } = await supabase
      .from('tags')
      .insert({ name, slug, color })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Tag already exists' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ tag }, { status: 201 })
  } catch (error: any) {
    console.error('Create tag error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create tag' },
      { status: 500 }
    )
  }
}