'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, X, Loader2, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

  const searchContainerRef = useRef<HTMLUListElement>(null)

  // Debounced search with 300ms delay
  const debouncedSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        setHasSearched(false)
        return
      }

      setIsLoading(true)
      setHasSearched(true)

      try {
        const response = await fetch(
          `/api/posts/search?q=${encodeURIComponent(searchQuery)}`
        )
        const data = await response.json()
        
        if (data.posts) {
          setResults(data.posts)
        }
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    },
    [query, searchContainerRef]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, searchContainerRef])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'Escape':
          setIsOpen(false)
          break
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
    if (!isOpen) setIsOpen(true)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setHasSearched(false)
    setIsOpen(false)
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
        <mark key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded transition-colors">
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
          Search posts by title or content
        </label>
        
        <div className="absolute inset-y-0 left-0 pl-10 flex items-center pointer-events-none">
          <Search 
            className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors"
            aria-hidden="true"
          />
        </div>

        <input
          id="search-input"
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search posts... (Ctrl+K)"
          autoComplete="off"
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-transparent transition-all duration-200
                     placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        
        {query && (
          <button
            onClick={handleClear}
            type="button"
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Dropdown Results - Accessible List */}
      {(isOpen || hasSearched) && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="Close search results"
          />

          <div 
            className="absolute top-full left-0 right-0 mt-2 w-full max-w-md max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden transition-colors duration-200"
            role="listbox"
            aria-label={`Search results: ${results.length} items found`}
            aria-orientation="vertical"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white" id="search-results-heading">
                  {isLoading ? (
                    <>Searching&hellip;</>
                  ) : results.length > 0 ? (
                    `${results.length} results found`
                  ) : (
                    'No results found'
                  )}
                </h3>
                
                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  aria-label="Close search results"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Results List with Keyboard Navigation */}
            <ul 
              ref={searchContainerRef}
              role="listbox"
              aria-labelledby="search-results-heading"
              className="py-2 max-h-[calc(96-2rem)] overflow-y-auto"
            >
              {isLoading ? (
                <li className="px-4 py-6 text-center text-gray-500 dark:text-gray-400" role="status">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    <span className="text-sm">Searching...</span>
                  </div>
                </li>
              ) : results.length > 0 ? (
                results.map((post, index) => (
                  <li
                    key={post.id}
                    role="option"
                    aria-selected={focusedIndex === index ? 'true' : 'false'}
                    aria-label={getResultAriaLabel(post, index)}
                    onClick={() => handleResultClick(post.slug)}
                    tabIndex={focusedIndex === index ? 0 : -1}
                    className={`
                      px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer
                      border-b border-gray-100 dark:border-gray-700 last:border-0
                      transition-all duration-150
                      ${focusedIndex === index 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : ''
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Cover Image Thumbnail */}
                      {post.cover_image && (
                        <img
                          src={post.cover_image}
                          alt={`Cover image for: ${post.title}`}
                          className="w-16 h-12 object-cover rounded flex-shrink-0"
                          loading="lazy"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 
                          className="text-base font-medium text-gray-900 dark:text-white line-clamp-1 transition-colors"
                        >
                          {highlightText(post.title, query)}
                        </h4>
                        
                        {post.excerpt && (
                          <p 
                            className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 transition-colors"
                          >
                            {highlightText(post.excerpt, query)}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{post.author?.name || 'Unknown'}</span>
                          <span>•</span>
                          <span>
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                          {post.category && (
                            <>
                              <span>•</span>
                              <span 
                                className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full transition-colors"
                              >
                                {post.category.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li 
                  className="px-4 py-6 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {hasSearched ? (
                      <>
                        No results found for &quot;{query}&quot;
                        <br />
                        <span className="text-xs">Try different keywords</span>
                      </>
                    ) : (
                      'Type to search...'
                    )}
                  </p>
                  {hasSearched && (
                    <button
                      onClick={() => setQuery('')}
                      className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                    >
                      Start typing to search
                    </button>
                  )}
                </li>
              )}
            </ul>

            {/* Footer with accessibility info */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span>Keyboard: ↑↓ Navigate • Enter: Select • Esc: Close</span>
                <span className="text-gray-400 dark:text-gray-500">
                  {results.length} items
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
