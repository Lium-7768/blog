'use client'

import { useState, useCallback, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt: string | null
  created_at: string
  author: { name: string } | null
  category: { name: string; slug: string } | null
}

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Debounced search
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
    []
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(query)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [query, debouncedSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (!isOpen) setIsOpen(true)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setHasSearched(false)
  }

  const handleResultClick = (slug: string) => {
    setIsOpen(false)
    setQuery('')
    router.push(`/posts/${slug}`)
  }

  const highlightText = (text: string, query: string) => {
    if (!text || !query) return text
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search posts..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-transparent transition-all duration-200
                     placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (query || hasSearched) && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto transition-colors duration-200">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 transition-colors">
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </div>
            ) : results.length > 0 ? (
              <ul className="py-2">
                {results.map((post) => (
                  <li
                    key={post.id}
                    onClick={() => handleResultClick(post.slug)}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1 transition-colors">
                      {highlightText(post.title, query)}
                    </h4>
                    {post.excerpt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 transition-colors">
                        {highlightText(post.excerpt, query)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400 transition-colors">
                      <span>{post.author?.name || 'Unknown'}</span>
                      {post.category && (
                        <>
                          <span>•</span>
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full transition-colors">
                            {post.category.name}
                          </span>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : hasSearched ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 transition-colors">
                <p>No results found for &quot;{query}&quot;</p>
                <p className="text-sm mt-1">Try different keywords</p>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}