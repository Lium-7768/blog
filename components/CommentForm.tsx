'use client'

import { useState } from 'react'
import { MessageSquare, Send, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

interface CommentFormProps {
  postId: string
  parentId?: string | null
  onCommentAdded?: () => void
}

export default function CommentForm({ postId, parentId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedContent = content.trim()
    if (trimmedContent.length < 1) {
      setError('Comment content cannot be empty')
      return
    }

    if (trimmedContent.length > 1000) {
      setError('Comment content max 1000 characters')
      return
    }

    setIsLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        setError('Please login first')
        setIsLoading(false)
        return
      }

      const userId = session.user.id

      const { data: commentData, error: insertError } = await supabase
        .from('comments')
        .insert([
          {
            content: trimmedContent,
            post_id: postId,
            author_id: userId,
            parent_id: parentId || null,
            status: 'pending',
          },
        ])
        .select()

      if (insertError) {
        throw new Error(insertError.message)
      }

      if (onCommentAdded) {
        onCommentAdded()
      }

      setContent('')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

    } catch (err) {
      console.error('Submit comment error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit comment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 transition-colors duration-300">
          <div className="w-8 h-8 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              className="w-4 h-4 text-white"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L1 13l-4 4"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">
              Comment submitted!
            </p>
            <p className="text-sm text-green-600 dark:text-green-300">
              Waiting for approval...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 transition-colors duration-300">
          <div className="w-8 h-8 rounded-full bg-red-600 dark:bg-red-500 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">
              {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 dark:text-red-300 hover:underline mt-1 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="comment-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {parentId ? 'Reply to comment' : 'Leave a comment'}
          </label>
          <textarea
            id="comment-content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              setError(null)
              setShowSuccess(false)
            }}
            placeholder="Write your comment... (Markdown supported)"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       dark:bg-gray-900 dark:text-white
                       placeholder:text-gray-400 dark:placeholder-gray-500
                       resize-none
                       transition-all duration-200
                       min-h-[120px]
                       max-h-[400px]"
            disabled={isLoading}
            aria-describedby={error ? 'comment-error' : undefined}
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {content.length} / 1000 characters
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !content.trim()}
          className="w-full bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg
                     hover:bg-blue-700 dark:hover:bg-blue-600
                     disabled:bg-gray-400 dark:disabled:bg-gray-700
                     disabled:cursor-not-allowed
                     transition-all duration-200
                     font-medium
                     flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>{parentId ? 'Reply' : 'Leave a comment'}</span>
            </>
          )}
        </button>

        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Comment Guidelines</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Be friendly and respectful</li>
                <li>No spam or advertising</li>
                <li>Constructive discussions welcome</li>
                <li>All comments require moderation</li>
                <li>Markdown syntax supported</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
