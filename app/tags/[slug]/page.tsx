import Link from 'next/link'
import { format } from 'date-fns'
import { notFound } from 'next/navigation'

async function getTagAndPosts(slug: string) {
  try {
    const { getServerClient } = await import('@/lib/supabase-server')
    const supabase = getServerClient()

    // Get tag info
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single()

    if (tagError || !tag) {
      return null
    }

    // Get posts with this tag using the junction table
    const { data: postIds } = await supabase
      .from('post_tags')
      .select('post_id')
      .eq('tag_id', tag.id)

    if (!postIds || postIds.length === 0) {
      return { tag, posts: [] }
    }

    const { data: posts } = await supabase
      .from('posts')
      .select('*, category:categories(*), author:profiles(name)')
      .eq('status', 'published')
      .in('id', postIds.map((p: any) => p.post_id))
      .order('created_at', { ascending: false })

    return { tag, posts: posts || [] }
  } catch (error) {
    console.error('Error fetching tag posts:', error)
    return null
  }
}

export default async function TagPage({ params }: { params: { slug: string } }) {
  const data = await getTagAndPosts(params.slug)

  if (!data) {
    notFound()
  }

  const { tag, posts } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Tag Header */}
        <div className="mb-12 text-center">
          <span
            className="inline-block px-4 py-2 rounded-full text-white text-lg font-medium"
            style={{ backgroundColor: tag.color }}
          >
            #{tag.name}
          </span>
          <p className="mt-4 text-gray-600">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} tagged with #{tag.name}
          </p>
        </div>

        {/* Posts List */}
        <div className="space-y-8">
          {posts.map((post: any) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
            >
              <Link href={`/posts/${post.slug}`}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
                  {post.title}
                </h2>
              </Link>

              <p className="text-gray-600 mb-4">{post.excerpt}</p>

              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <span>{post.author?.name || 'Unknown'}</span>
                <span>•</span>
                <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                {post.category && (
                  <>
                    <span>•</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {post.category.name}
                    </span>
                  </>
                )}
              </div>
            </article>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No posts yet with this tag.</p>
              <Link
                href="/"
                className="inline-block mt-4 text-blue-600 hover:underline"
              >
                Browse all posts →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}