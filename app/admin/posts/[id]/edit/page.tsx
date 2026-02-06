'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TagInput from '@/components/TagInput'
import ImageUpload from '@/components/ImageUpload'

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [categories, setCategories] = useState<any[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingTags, setLoadingTags] = useState(false)

  useEffect(() => {
    loadPostData()
  }, [id])

  const loadPostData = async () => {
    const { getClient } = await import('@/lib/supabase')
    const supabase = getClient()

    // Load post
    const { data: post } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (!post) {
      setError('Post not found')
      return
    }

    setTitle(post.title)
    setSlug(post.slug)
    setContent(post.content)
    setExcerpt(post.excerpt || '')
    setCategoryId(post.category_id || '')
    setStatus(post.status)
    setCoverImage(post.cover_image)

    // Load categories
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (cats) setCategories(cats)

    // Load post tags
    const { data: postTags } = await supabase
      .from('post_tags')
      .select('tag_id')
      .eq('post_id', id)
    if (postTags) {
      setSelectedTags(postTags.map((pt: any) => pt.tag_id))
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setLoadingTags(true)

    // Lazy import to avoid build-time errors
    const { getClient } = await import('@/lib/supabase')
    const supabase = getClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Please login first')
      setLoading(false)
      setLoadingTags(false)
      return
    }

    // Update post
    const { data: post, error: updateError } = await (supabase
      .from('posts') as any)
      .update({
        title,
        slug,
        content,
        excerpt,
        status,
        category_id: categoryId || null,
        cover_image: coverImage || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      setLoadingTags(false)
      return
    }

    // Update tags
    if (selectedTags.length > 0) {
      // Remove old tags
      const { error: deleteError } = await (supabase
        .from('post_tags')
        .delete()
        .eq('post_id', id)

      if (deleteError) {
        console.error('Delete old tags error:', deleteError)
        // Continue even if delete fails
      }

      // Add new tags
      if (selectedTags.length > 0 && post) {
        const tagRelations = selectedTags.map((tagId) => ({
          post_id: post.id,
          tag_id: tagId,
        }))

        await (supabase.from('post_tags') as any).insert(tagRelations)
      }

    setLoadingTags(false)
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center space-x-4">
          <Link href="/admin" className="text-gray-600 hover:text-gray-900">
            ← Back to Admin
          </Link>
          <h1 className="text-2xl font-bold">Edit Post</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content (Markdown) *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image
            </label>
            <ImageUpload
              onUpload={(url) => setCoverImage(url)}
              initialUrl={coverImage}
              type="cover"
            />
            {coverImage && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-16 h-16 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage(null)}
                  className="text-red-600 hover:text-red-800 px-3 py-1 rounded bg-red-50 hover:bg-red-100"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          <TagInput selectedTags={selectedTags} onChange={setSelectedTags} />

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || loadingTags}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>

            <Link
              href="/admin"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}