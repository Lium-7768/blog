import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Validation schema
const commentSchema = z.object({
  content: z.string().min(1, 'Comment content cannot be empty').max(1000, 'Comment content max 1000 characters'),
})

type Comment = {
  id: string
  content: string
  post_id: string
  author_id: string
  parent_id: string | null
  author: { name: string; avatar_url: string | null } | null
  status: 'pending' | 'approved' | 'spam'
  created_at: string
}

type CommentsResponse = {
  comments: Comment[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: post } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const postId = post.id

    const { data: comments, error } = await supabase
      .from('comments')
      .select('*, author:profiles(name, avatar_url)')
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get comments error:', error)
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }

    return NextResponse.json({ comments: comments || [] })
  } catch (error: any) {
    console.error('Get comments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const validation = commentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const content = validation.data.content

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const { data: post } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const postId = post.id

    const { data: newComment, error: insertError } = await supabase
      .from('comments')
      .insert({
        content,
        post_id: postId,
        author_id: userId,
        parent_id: body.parent_id || null,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(insertError.message)
    }

    const { data: commentWithAuthor } = await supabase
      .from('comments')
      .select('*, author:profiles(name, avatar_url)')
      .eq('id', newComment.id)
      .single()

    return NextResponse.json({ comment: commentWithAuthor }, { status: 201 })
  } catch (error: any) {
    console.error('Create comment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
