'use client'

import { useState, useEffect, useRef } from 'react'
import { Bold, Italic, Code, Link, Save, Type, Eye, EyeOff } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownEditorProps {
  initialContent?: string
  postId?: string
  onSave?: (content: string) => void
  onPublish?: (content: string, status: 'draft' | 'published') => void
  title?: string
}

export default function MarkdownEditor({
  initialContent = '',
  postId,
  onSave,
  onPublish,
  title = 'New Post'
}: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [previewMode, setPreviewMode] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [lastSaved, setLastSaved] = useState(initialContent)
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [readTime, setReadTime] = useState('0 min')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setContent(initialContent)
    setLastSaved(initialContent)
  }, [initialContent])

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length
    const chars = content.length
    const readTime = Math.ceil(words / 200)

    setWordCount(words)
    setCharCount(chars)
    setReadTime(`${readTime} min`)

    setUnsavedChanges(content !== lastSaved)
  }, [content, lastSaved])

  useEffect(() => {
    const saveInterval = setInterval(async () => {
      if (content && content !== lastSaved) {
        await saveDraft()
      }
    }, 30000)

    return () => clearInterval(saveInterval)
  }, [content, lastSaved])

  const saveDraft = async () => {
    if (!content || content === lastSaved) return

    setIsSaving(true)

    try {
      const draftKey = postId ? `draft_${postId}` : 'draft_new'
      localStorage.setItem(draftKey, content)
      setLastSaved(content)
      setUnsavedChanges(false)

      if (postId && postId !== 'new') {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        })

        if (!response.ok) {
          throw new Error('Failed to save post')
        }

        const data = await response.json()
        console.log('Post saved:', data)
      }

      if (onSave) {
        onSave(content)
      }

      alert('Draft saved successfully!')
    } catch (error) {
      console.error('Save draft error:', error)
      alert('Failed to save draft. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const publishPost = async () => {
    if (!content || content.trim() === '') {
      alert('Content cannot be empty')
      return
    }

    setIsPublishing(true)

    try {
      const status = postId ? 'published' : 'published'
      
      if (onPublish) {
        await onPublish(content, status)
      } else if (onSave) {
        await onSave(content)
      }

      // Clear draft
      if (postId) {
        localStorage.removeItem(`draft_${postId}`)
      } else {
        localStorage.removeItem('draft_new')
      }

      setLastSaved(content)
      setUnsavedChanges(false)
      
      alert('Post published successfully!')
    } catch (error) {
      console.error('Publish error:', error)
      alert('Failed to publish post. Please try again.')
    } finally {
      setIsPublishing(false)
    }
  }

  const insertAtCursor = (before: string, after: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newValue = content.substring(0, start) + before + selectedText + after + content.substring(end)

    setContent(newValue)
    
    setTimeout(() => {
      textarea.focus()
      const newStart = start + before.length
      const newEnd = newStart + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newStart, newEnd)
    }, 0)
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>

            <div className="flex items-center gap-2">
              {/* Save Status */}
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <Save className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Saving...</span>
                </div>
              )}
              {unsavedChanges && !isSaving && !isPublishing && (
                <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                  <Save className="w-4 h-4" aria-hidden="true" />
                  <span>Unsaved</span>
                </div>
              )}
              {!unsavedChanges && lastSaved && !isSaving && !isPublishing && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <Save className="w-4 h-4" aria-hidden="true" />
                  <span>Saved</span>
                </div>
              )}

              {/* Publish Button */}
              {onPublish && (
                <button
                  onClick={publishPost}
                  type="button"
                  disabled={isPublishing || !content.trim()}
                  aria-label="Publish post"
                  className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {isPublishing ? (
                    <>
                      <Type />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Type />
                      <span>Publish</span>
                    </>
                  )}
                </button>
              )}

              {/* Save Button */}
              <button
                onClick={saveDraft}
                type="button"
                disabled={isSaving}
                aria-label="Save content"
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium"
              >
                {isSaving ? (
                  <>
                    <Save className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" aria-hidden="true" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Formatting Toolbar */}
          <div className="py-2 flex flex-wrap items-center gap-2 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Text:
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => insertAtCursor('**', '**')}
                aria-label="Bold"
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor('*', '*')}
                aria-label="Italic"
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor('`', '`')}
                aria-label="Code"
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Code"
              >
                <Code className="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor('[', ']')}
                aria-label="Link"
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Link"
              >
                <Link className="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor('![', '](url)')}
                aria-label="Image"
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Image"
              >
                <Link className="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-gray-200 dark:bg-gray-700" />

          <div className="py-2 flex flex-wrap items-center gap-2 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Block:
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => insertAtCursor('## ', '')}
                aria-label="Heading"
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Heading"
              >
                <Code className="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor('> ', '')}
                aria-label="Quote"
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Quote"
              >
                <Code className="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor('- ', '')}
                aria-label="Bullet List"
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Bullet List"
              >
                <Code className="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor('1. ', '')}
                aria-label="Numbered List"
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Numbered List"
              >
                <Code className="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor & Preview Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700">
          <div className="flex flex-col h-full">
            {/* Editor Header */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Markdown
              </span>

              <button
                onClick={() => setPreviewMode(!previewMode)}
                type="button"
                aria-label={previewMode ? 'Switch to edit mode' : 'Switch to preview mode'}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {previewMode ? (
                  <Eye className="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
                ) : (
                  <Save className="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Editor Textarea */}
            <textarea
              id="markdown-editor"
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content in Markdown..."
              className="flex-1 w-full px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm leading-relaxed resize-none focus:outline-none transition-colors"
              spellCheck={false}
              autoFocus
            />

            {/* Editor Footer */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span>{wordCount} words</span>
                  <span>{charCount} characters</span>
                  <span>~{readTime} read</span>
                </div>

                <div className="flex items-center gap-2">
                  {unsavedChanges && !isSaving && !isPublishing && (
                    <span className="text-orange-600 dark:text-orange-400">Unsaved</span>
                  )}
                  {!unsavedChanges && lastSaved && !isSaving && !isPublishing && (
                    <span className="text-green-600 dark:text-green-400">Saved</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col h-full">
            {/* Preview Header */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Preview
              </span>

              <button
                onClick={() => setPreviewMode(!previewMode)}
                type="button"
                aria-label={previewMode ? 'Switch to edit mode' : 'Switch to preview mode'}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {previewMode ? (
                  <Save className="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 py-6 lg:py-8">
                <div className="prose prose-sm lg:prose-lg max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 lg:p-8 transition-colors">
                  {content ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                    >
                      {content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-gray-500">Start typing to see preview...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
