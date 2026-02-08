'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock } from 'lucide-react'

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  created_at: string
  cover_image: string | null
  category: { name: string; slug: string } | null
  tags: Array<{ name: string }>
}

interface RelatedPostsProps {
  currentPostId: string
  currentPostTags: Array<{ name: string }>
  currentPostCategory: { name: string; slug: string } | null
  limit?: number
}

export default function RelatedPosts({
  currentPostId,
  currentPostTags,
  currentPostCategory,
  limit = 3
}: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      setIsLoading(true)

      try {
        const tagQuery = currentPostTags.map(tag => tag.name).join(' ')
        const categoryQuery = currentPostCategory ? currentPostCategory.slug : ''

        const response = await fetch(
          `/api/posts/search?q=${encodeURIComponent(tagQuery)}&category=${categoryQuery}&exclude=${currentPostId}&limit=${limit}`
        )
        const data = await response.json()

        if (data.posts) {
          const filtered = data.posts
            .filter((post: any) => post.id !== currentPostId)
            .filter((post: any, index: number) => 
              index === data.posts.findIndex((p: any) => p.id === post.id)
            )

          setRelatedPosts(filtered.slice(0, limit))
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
  }, [currentPostId, currentPostTags, currentPostCategory, limit])

  if (relatedPosts.length === 0 && !isLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center transition-colors duration-200">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No related posts yet.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8 lg:mt-12">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Related Posts ({relatedPosts.length})
      </h3>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(limit)].map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {relatedPosts.map((post, index) => (
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
                        alt={`Cover image for: ${post.title}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-4">
                    {post.category && (
                      <div className="mb-2">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-1 rounded-full inline-block transition-colors">
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

                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        <time dateTime={post.created_at}>
                          {new Date(post.created_at).toLocaleDateString()}
                        </time>
                      </div>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {post.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={`${post.id}-tag-${tagIndex}`}
                              className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full transition-colors"
                            >
                              {tag.name}
                            </span>
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

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 rounded-lg" />
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
