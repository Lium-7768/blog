import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ThemeToggle from '@/components/ThemeToggle'
import TableOfContents from '@/components/TableOfContents'
import ReadingProgress from '@/components/ReadingProgress'
import CommentForm from '@/components/CommentForm'
import CommentList from '@/components/CommentList'
import type { Metadata } from 'next'

// ISR: Revalidate every 60 seconds
export const revalidate = 60

async function getPost(slug: string) {
  try {
    const { getServerClient } = await import('@/lib/supabase-server')
    const supabase = await getServerClient()

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

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
    }
  }

  const title = post.title
  const description = post.excerpt || post.content.slice(0, 160).replace(/[#*`]/g, '')
  const author = post.author?.name || 'Unknown'
  const tags = post.tags?.map((t: any) => t.name) || []

  return {
    title,
    description,
    authors: [{ name: author }],
    keywords: tags,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: [author],
      tags,
      images: post.cover_image ? [
        {
          url: post.cover_image,
          alt: title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30 transition-colors duration-200">
        <div className="max-w-3xl mx-auto px-4 py-3 lg:py-6 flex justify-between items-center">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm lg:text-base transition-colors">
            ← Back to Home
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 py-6 lg:py-12">
        <header className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 lg:mb-4 transition-colors">{post.title}</h1>

          <div className="flex flex-wrap items-center text-xs lg:text-sm text-gray-500 dark:text-gray-400 gap-x-3 lg:gap-x-4 gap-y-1 transition-colors">
            <span>{post.author?.name || 'Unknown'}</span>
            <span className="hidden sm:inline">•</span>
            <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
            <span className="hidden sm:inline">•</span>
            <span>{post.view_count || 0} views</span>
          </div>

          {(post.category || (post.tags && post.tags.length > 0)) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.category && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm transition-colors">
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

        <div className="prose prose-sm lg:prose-lg max-w-none dark:prose-invert transition-colors duration-200">
          <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{post.content}</ReactMarkdown>
        </div>
      </article>

      {/* Table of Contents & Reading Progress */}
      {post && (
        <>
          <TableOfContents />
          <ReadingProgress />
        </>
      )}

      {/* Comments Section */}
      <div className="mt-8 lg:mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 lg:p-8 transition-colors duration-200">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          评论区 ({post.id})
        </h2>
        
        <CommentForm postId={post.id} onCommentAdded={() => {}} />
        <CommentList postId={post.id} />
      </div>
    </div>
  )
}