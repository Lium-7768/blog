'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Tag as TagIcon } from 'lucide-react'

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  post_count: number
}

export default function TagCloud() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const response = await fetch('/api/tags')
      const data = await response.json()
      if (data.tags) {
        // Only show tags with posts
        const activeTags = data.tags.filter((t: Tag) => t.post_count > 0)
        setTags(activeTags)
      }
    } catch (error) {
      console.error('Failed to load tags:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-pulse flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-16 h-8 bg-gray-200 rounded-full" />
          ))}
        </div>
      </div>
    )
  }

  if (tags.length === 0) {
    return null
  }

  // Calculate font size based on post count (min 0.875rem, max 1.25rem)
  const maxCount = Math.max(...tags.map((t) => t.post_count))
  const minCount = Math.min(...tags.map((t) => t.post_count))
  
  const getFontSize = (count: number) => {
    if (maxCount === minCount) return '0.875rem'
    const size = 0.875 + ((count - minCount) / (maxCount - minCount)) * 0.375
    return `${size}rem`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <TagIcon className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:scale-105"
            style={{
              backgroundColor: `${tag.color}20`, // 20% opacity
              color: tag.color,
              fontSize: getFontSize(tag.post_count),
            }}
          >
            #{tag.name}
            <span className="text-xs opacity-70">({tag.post_count})</span>
          </Link>
        ))}
      </div>
    </div>
  )
}