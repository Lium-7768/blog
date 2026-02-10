'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  created_at: string
  cover_image: string | null
  category: { name: string; slug: string } | null
  tags: Array<{ name: string; slug?: string }>
}

interface RelatedPostsProps {
  currentPostId: string
  currentPostTags: Array<{ name: string }>
  limit?: number
}

export default function RelatedPosts({
  currentPostId,
  currentPostTags,
  limit = 3
}: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      setIsLoading(true)

      try {
        const tagQuery = currentPostTags.map(tag => tag.name).join(' ')
        const response = await fetch(`/api/posts/search?tags=${encodeURIComponent(tagQuery)}&exclude=${currentPostId}&limit=${limit}`)
        const data = await response.json()

        if (data.posts) {
          setRelatedPosts(data.posts)
        } else {
          setRelatedPosts([])
        }
      } catch (error) {
        console.error('Failed to fetch related posts:', error)
        setRelatedPosts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedPosts()
  }, [currentPostId, currentPostTags, limit])

  if (isLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 transition-colors">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center animate-spin">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Loading related posts...</p>
      </div>
    )
  }

  if (relatedPosts.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 transition-colors">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          No related posts yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Related Posts ({relatedPosts.length})
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {relatedPosts.slice(0, limit).map((post) => (
          <article
            key={post.id}
            className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700"
          >
            <Link href={`/posts/${post.slug}`}>
              <div className="relative">
                {post.cover_image && (
                  <div className="aspect-video w-full rounded-t-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={post.cover_image}
                      alt={`Cover for: ${post.title}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="p-4">
                  {post.category && (
                    <div className="mb-2">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded-full inline-block transition-colors">
                        {post.category.name}
                      </span>
                    </div>
                  )}

                  <h4 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 transition-colors">
                    {post.title}
                  </h4>

                  {post.excerpt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 transition-colors">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" aria-hidden="true" />
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <Link
                              key={tag.name || index}
                              href={tag.slug ? `/tags/${tag.slug}` : '#'}
                              className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs px-1.5 py-0.5 rounded transition-colors"
                            >
                              #{tag.name}
                            </Link>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-gray-400 dark:text-gray-500">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 rounded-lg"></div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
