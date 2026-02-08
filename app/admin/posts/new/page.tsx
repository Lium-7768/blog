'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MarkdownEditor from '@/components/MarkdownEditor'
import TagInput from '@/components/TagInput'

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [categories, setCategories] = useState<any[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [postId, setPostId] = useState<string>('new')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const { db } = await import('@/lib/supabase')
    const { data } = await db.categories.getAll()
    if (data) setCategories(data)
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slug) {
      setSlug(generateSlug(value))
    }
  }

  const handleSaveContent = async (content: string) => {
    console.log('Content saved:', content.substring(0, 50) + '...')
  }

  const handlePublishPost = async (content: string, publishStatus: 'draft' | 'published') => {
    if (!title || !content || content.trim() === '') {
      alert('Title and content cannot be empty')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { getClient } = await import('@/lib/supabase')
      const supabase = getClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Please login first')
        setLoading(false)
        return
      }

      const userId = user.id

      // Create post with type assertion to avoid Supabase type issues
      const { data: post, error: postError } = await (supabase.from('posts') as any)
        .insert({
          title,
          slug,
          content,
          excerpt,
          status: publishStatus,
          author_id: userId,
          category_id: categoryId || null,
        })
        .select()
        .single()

      if (postError) {
        throw new Error(postError.message)
      }

      // Add tags if any
      if (selectedTags.length > 0 && post) {
        const tagRelations = selectedTags.map((tagId) => ({
          post_id: post.id,
          tag_id: tagId,
        }))

        await (supabase.from('post_tags') as any).insert(tagRelations)
      }

      // Update post ID
      setPostId(post.id)

      // Clear draft
      localStorage.removeItem('draft_new')

      alert(`${publishStatus === 'published' ? 'Post published' : 'Draft saved'} successfully!`)
      router.push('/admin')
      router.refresh()
    } catch (err) {
      console.error('Publish post error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 flex items-center space-x-4">
          <Link href="/admin" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            ← Back to Admin
          </Link>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
            New Post
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
        {/* Post Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 lg:p-8 mb-6">
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter post title..."
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Slug *
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="post-url"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Brief description for search results..."
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              <TagInput selectedTags={selectedTags} onChange={setSelectedTags} />
            </div>
          </div>
        </div>

        {/* Markdown Editor */}
        <MarkdownEditor
          initialContent={''}
          postId={postId}
          onSave={handleSaveContent}
          onPublish={handlePublishPost}
          title="New Post"
        />

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <Link
            href="/admin"
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center"
          >
            Cancel
          </Link>
        </div>
      </main>
    </div>
  )
}
