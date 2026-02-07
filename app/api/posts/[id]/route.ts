import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { z } from 'zod'

// Validation schema
const paramsSchema = z.object({
  id: z.string().uuid('Invalid post ID'),
})

/**
 * DELETE /api/posts/[id]
 * Delete a post (authenticated, must be owner)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Validate params
    const resolvedParams = await params
    const validation = paramsSchema.safeParse(resolvedParams)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid post ID', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const postId = validation.data.id

    // 2. Get admin client (server-side only)
    const supabaseAdmin = getAdminClient()

    // 3. Get session from request cookies (using anon client for auth check)
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        },
      }
    )
    
    // Get auth token from request
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    // 4. Verify user owns the post (using admin client to bypass RLS)
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if ((post as any).author_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own posts' },
        { status: 403 }
      )
    }

    // 5. Delete the post (admin client)
    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}