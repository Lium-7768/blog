import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

async function getPost(slug: string) {
  try {
    const { getServerClient } = await import('@/lib/supabase-server')
    const supabase = getServerClient()
    
    const { data: post, error } = await supabase
      .from('posts')
      .select('*, category:categories(*), author:profiles(name)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !post) return null

    // Get post tags
    const { data: postTags } = await supabase
      .from('post_tags')
      .select('tag:tags(*)')
      .eq('post_id', post.id)

    // Increment view count
    await supabase.rpc('increment_post_views', { post_id: post.id })

    return {
      ...post,
      tags: postTags?.map((pt: any) => pt.tag) || []
    }
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 lg:py-6">
          <Link href="/" className="text-blue-600 hover:underline text-sm lg:text-base">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 py-6 lg:py-12">
        <header className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">{post.title}</h1>

          <div className="flex flex-wrap items-center text-xs lg:text-sm text-gray-500 gap-x-3 lg:gap-x-4 gap-y-1">
            <span>{post.author?.name || 'Unknown'}</span>
            <span className="hidden sm:inline">•</span>
            <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
            <span className="hidden sm:inline">•</span>
            <span>{post.view_count || 0} views</span>
          </div>

          {(post.category || (post.tags && post.tags.length > 0)) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.category && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {post.category.name}
                </span>
              )}
              {post.tags?.map((tag: any) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="px-3 py-1 rounded-full text-sm text-white hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: tag.color }}
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </header>

        {post.cover_image && (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-48 lg:h-64 object-cover rounded-lg mb-6 lg:mb-8"
          />
        )}

        <div className="prose prose-sm lg:prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  )
}