import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ThemeToggle from '@/components/ThemeToggle'
import TableOfContents from '@/components/TableOfContents'
import RelatedPosts from '@/components/RelatedPosts'
import ReadingProgress from '@/components/ReadingProgress'
import CommentForm from '@/components/CommentForm'
import CommentList from '@/components/CommentList'
import SocialShare from '@/components/SocialShare'
import type { Metadata } from 'next'

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

    const { data: postTags } = await supabase
      .from('post_tags')
      .select('tag:tags(*)')
      .eq('post_id', post.id)

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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
    }
  }

  const title = post.title
  const description = post.excerpt || post.content.slice(0, 160).replace(/[#*]/g, '')
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
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.cover_image ? [post.cover_image] : [],
    },
  }
}

export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                ← Back to Home
              </Link>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {post.title}
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-200">
          <header className="px-6 lg:px-8 pb-4 lg:pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {post.title}
                </h2>

                <div className="flex items-center space-x-2 mb-3">
                  {post.category && (
                    <Link
                      href={`/tags/${post.category.slug}`}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium px-3 py-1 rounded-full transition-colors"
                    >
                      #{post.category.name}
                    </Link>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      {post.tags.slice(0, 5).map((tag: any) => (
                        <Link
                          key={tag.id}
                          href={`/tags/${tag.slug}`}
                          className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  by {post.author?.name || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>{format(new Date(post.created_at), 'PPP')}</span>
                </div>
              </div>
            </div>

            {post.excerpt && (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {post.excerpt}
              </p>
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

        <TableOfContents />
        <ReadingProgress />
        <SocialShare
          title={post.title}
          url={`/posts/${post.slug}`}
          description={post.excerpt || post.content.slice(0, 160)}
          tags={post.tags}
        />
        {post && (
          <div className="mb-8 lg:mb-12">
            <RelatedPosts
              currentPostId={post.id}
              currentPostTags={post.tags}
            />
          </div>
        )}

        <div className="mt-8 lg:mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 lg:p-8 transition-colors duration-200">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            评论区 ({post.id})
          </h2>
          
          <CommentForm postId={post.id} onCommentAdded={() => {}} />
          <CommentList postId={post.id} />
        </div>
      </div>
    </div>
  )
}
