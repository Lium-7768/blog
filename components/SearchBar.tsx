'use client'

import { useState, useCallback, useEffect } from 'react'
import { Search, X, Loader2, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import SearchHistory from '@/components/SearchHistory'

interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt: string | null
  created_at: string
  author: { name: string } | null
  category: { name: string; slug: string } | null
  cover_image: string | null
}

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [hasSearched, setHasSearched] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Debounced search with 300ms delay
  const debouncedSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        setHasSearched(false)
        setShowHistory(true)
        return
      }

      setIsLoading(true)
      setHasSearched(true)
      setShowHistory(false)

      try {
        const response = await fetch(`/api/posts/search?q=${encodeURIComponent(searchQuery)}&limit=8`)
        const data = await response.json()

        if (data.posts) {
          setResults(data.posts)
        } else {
          setResults([])
        }
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Search when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        debouncedSearch(query)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, debouncedSearch])

  // Keyboard navigation for search results
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex(prev =>
            prev < results.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex(prev =>
            prev > 0 ? prev - 1 : prev
          )
          break
        case 'Enter':
          if (focusedIndex >= 0 && focusedIndex < results.length) {
            router.push(`/posts/${results[focusedIndex].slug}`)
            setIsOpen(false)
          }
          break
        case 'Home':
          if (e.shiftKey) {
            setIsOpen(false)
          }
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, results, focusedIndex])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setIsOpen(true)
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  const handleHistorySelect = (historyQuery: string) => {
    setQuery(historyQuery)
    setIsOpen(true)
    setShowHistory(false)
    setHasSearched(false)
    debouncedSearch(historyQuery)
  }

  const handleHistoryClear = () => {
    setShowHistory(false)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setHasSearched(false)
    setIsOpen(false)
    setShowHistory(true)
  }

  const handleResultClick = (slug: string) => {
    setIsOpen(false)
    setQuery('')
    router.push(`/posts/${slug}`)
  }

  const highlightText = (text: string, query: string) => {
    if (!text || !query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 px-0.5 rounded transition-colors">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const getResultAriaLabel = (post: SearchResult, index: number) => {
    return `Search result: ${post.title}, ${index + 1} of ${results.length}`
  }

  return (
    <div
      className="relative w-full max-w-md"
      role="search"
      aria-label="Search posts"
    >
      {/* Search Input - Accessible Form Control */}
      <div className="relative">
        <label
          htmlFor="search-input"
          className="sr-only"
        >
          Search posts...
        </label>

        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" aria-hidden="true" />

        <input
          id="search-input"
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search posts..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-200"
          aria-expanded={isOpen}
          aria-controls="search-results-list"
          aria-haspopup="listbox"
          aria-label="Search posts"
        />

        {query && (
          <button
            onClick={handleClear}
            type="button"
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-3 h-3 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          </button>
        )}

        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-600 dark:text-blue-400 animate-spin" aria-hidden="true" />
        )}
      </div>

      {/* Search History */}
      {isOpen && showHistory && (
        <SearchHistory
          onHistorySelect={handleHistorySelect}
          onClearHistory={handleHistoryClear}
          currentQuery={query}
        />
      )}

      {/* Search Results Dropdown */}
      {isOpen && !showHistory && (
        <div
          id="search-results-list"
          role="listbox"
          aria-label="Search results"
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm">Searching...</p>
            </div>
          ) : results.length === 0 && hasSearched ? (
            <div
              className="p-4 text-center text-gray-500 dark:text-gray-400"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm">No results found</p>
            </div>
          ) : results.length > 0 ? (
            <ul
              className="max-h-96 overflow-y-auto"
              role="list"
              aria-activedescendant={focusedIndex >= 0 ? `search-result-${focusedIndex}` : undefined}
            >
              {results.map((post, index) => (
                <li
                  key={post.id}
                  id={`search-result-${index}`}
                  role="option"
                  aria-selected={focusedIndex === index}
                  aria-label={getResultAriaLabel(post, index)}
                  onClick={() => handleResultClick(post.slug)}
                  onMouseMove={() => setFocusedIndex(index)}
                  className={`flex items-start gap-3 p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900 ${
                    focusedIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  {/* Cover Image Thumbnail */}
                  {post.cover_image && (
                    <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={post.cover_image}
                        alt={`Cover for ${post.title}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Category Badge */}
                    {post.category && (
                      <span className="mb-1 inline-block">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded-full transition-colors">
                          {post.category.name}
                        </span>
                      </span>
                    )}

                    {/* Title */}
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-2 transition-colors">
                      {highlightText(post.title, query)}
                    </h4>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 transition-colors">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {post.author && (
                        <span>by {post.author.name}</span>
                      )}
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Chevron Icon */}
                  <ChevronDown className="flex-shrink-0 w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                </li>
              ))}
            </ul>
          ) : (
            <div
              className="p-4 text-center text-gray-400 dark:text-gray-600"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm">Start typing to search...</p>
            </div>
          )}

          {/* Footer */}
          {results.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {results.length} result{results.length === 1 ? '' : 's'} • Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono text-xs">Enter</kbd> to open
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
