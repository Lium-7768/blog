'use client'

import { useState, useEffect } from 'react'
import { Trash, Reply, MoreHorizontal } from 'lucide-react'
import { getClient } from '@/lib/supabase'

interface Comment {
  id: string
  content: string
  post_id: string
  author_id: string
  parent_id: string | null
  author: { name: string; avatar_url: string | null } | null
  status: 'pending' | 'approved' | 'spam'
  created_at: string
  replies?: Comment[]
}

interface CommentListProps {
  postId: string
  currentUser?: { id: string }
  refreshComments?: () => void
}

export default function CommentList({ postId, currentUser, refreshComments }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [showAllComments, setShowAllComments] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [postId, refreshComments])

  const fetchComments = async () => {
    setIsLoading(true)

    try {
      const supabase = getClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        setComments([])
        return
      }

      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          author_id,
          parent_id,
          status,
          created_at,
          author:profiles(name, avatar_url)
        `)
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!commentsData) {
        setComments([])
        return
      }

      const mappedComments: Comment[] = commentsData.map((item: any): Comment => ({
        id: item.id,
        content: item.content,
        post_id: item.post_id,
        author_id: item.author_id,
        parent_id: item.parent_id,
        status: item.status,
        created_at: item.created_at,
        author: item.author,
        replies: [],
      }))

      setComments(mappedComments)
    } catch (error) {
      console.error('Fetch comments error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReply = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId)
  }

  const handleDelete = async (commentId: string, authorId: string) => {
    if (!currentUser || currentUser.id !== authorId) {
      alert('You can only delete your own comments')
      return
    }

    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const supabase = getClient()
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      await fetchComments()
      
      if (refreshComments) {
        refreshComments()
      }
    } catch (error) {
      console.error('Delete comment error:', error)
      alert('Failed to delete comment. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={`skeleton-${i}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse"
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center transition-colors duration-200">
        <p className="text-gray-500 dark:text-gray-400 transition-colors">
          No comments yet. Be the first to comment!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h3>

        {comments.length > 5 && !showAllComments && (
          <button
            onClick={() => setShowAllComments(true)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors"
          >
            View all {comments.length} comments
          </button>
        )}
      </div>

      <div className="space-y-4">
        {comments.slice(0, showAllComments ? comments.length : 5).map((comment) => (
          <div
            key={comment.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-all duration-200
              ${comment.status === 'pending' ? 'border-l-4 border-yellow-400' : 'border-l-4 border-transparent'}
            `}
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {comment.author?.avatar_url ? (
                  <img
                    src={comment.author.avatar_url}
                    alt={comment.author.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium">
                    {comment.author?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {comment.author?.name || 'Unknown'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                  {comment.status === 'pending' && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 ml-2">
                      Pending
                    </span>
                  )}
                </div>

                <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {comment.content}
                </div>

                {currentUser && (
                  <div className="flex items-center space-x-2 mt-3">
                    <button
                      onClick={() => handleReply(comment.id)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-1.5"
                    >
                      <Reply className="w-4 h-4" aria-hidden="true" />
                      <span>Reply</span>
                    </button>

                    {currentUser.id === comment.author_id && (
                      <button
                        onClick={() => handleDelete(comment.id, comment.author_id)}
                        className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1.5"
                      >
                        <Trash className="w-4 h-4" aria-hidden="true" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {comments.length > 5 && !showAllComments && (
        <button
          onClick={() => setShowAllComments(true)}
          className="w-full py-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-center transition-colors"
        >
          Load more comments ({comments.length - 5})
        </button>
      )}
    </div>
  )
}
