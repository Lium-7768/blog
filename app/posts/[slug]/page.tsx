import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/supabase'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default async function PostPage({ params }: { params: { slug: string } }) {
  const { data: post, error } = await db.posts.getBySlug(params.slug)

  if (!post || error) {
    notFound()
  }

  // Increment view count
  await db.posts.incrementViews(post.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <span>{post.author?.name}</span>
            <span>•</span>
            <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
            <span>•</span>
            <span>{post.view_count} views</span>
          </div>

          {post.category && (
            <div className="mt-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {post.category.name}
              </span>
            </div>
          )}
        </header>

        {post.cover_image && (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-8"
          />
        )}

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  )
}