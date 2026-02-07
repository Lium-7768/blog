'use client'

import { useState, useEffect } from 'react'

interface SearchHistoryItem {
  query: string
  timestamp: number
}

interface SearchHistoryProps {
  onHistorySelect: (query: string) => void
  onClearHistory: () => void
  currentQuery: string
}

export default function SearchHistory({
  onHistorySelect,
  onClearHistory,
  currentQuery
}: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])

  useEffect(() => {
    // Load search history from localStorage
    try {
      const stored = localStorage.getItem('search_history')
      if (stored) {
        const parsedHistory = JSON.parse(stored) as SearchHistoryItem[]
        setHistory(parsedHistory.slice(0, 10)) // Keep only last 10 searches
      }
    } catch (error) {
      console.error('Failed to load search history:', error)
    }
  }, [])

  const addToHistory = (query: string) => {
    if (!query.trim()) return

    const newHistory: SearchHistoryItem[] = [
      { query, timestamp: Date.now() },
      ...history.filter(item => item.query.toLowerCase() !== query.toLowerCase()),
      ...history.slice(0, 9) // Keep only last 10 unique searches
    ]

    setHistory(newHistory)
    localStorage.setItem('search_history', JSON.stringify(newHistory))
  }

  const handleHistoryClick = (query: string) => {
    onHistorySelect(query)
  }

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem('search_history')
    onClearHistory()
  }

  const clearIndividualItem = (item: SearchHistoryItem) => {
    const newHistory = history.filter(h => h.query !== item.query)
    setHistory(newHistory)
    localStorage.setItem('search_history', JSON.stringify(newHistory))
  }

  return (
    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          搜索历史
        </h3>
        
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            type="button"
            aria-label="Clear search history"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            清除历史
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors">
          <p className="text-sm">暂无搜索历史</p>
          <p className="text-xs mt-1">开始搜索后，历史会自动保存</p>
        </div>
      ) : (
        <div className="space-y-2" role="list" aria-label="Search history">
          {history.map((item, index) => (
            <div
              key={`${item.query}-${index}`}
              onClick={() => handleHistoryClick(item.query)}
              className="group flex items-center justify-between p-3 rounded-lg 
                         hover:bg-gray-50 dark:hover:bg-gray-700 
                         cursor-pointer transition-all duration-200"
              role="listitem"
              aria-label={`Search for: ${item.query}`}
              tabIndex={0}
            >
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-900 dark:text-white">
                  {item.query}
                </span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    clearIndividualItem(item)
                  }}
                  type="button"
                  aria-label={`Remove ${item.query} from history`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 6L6 18L6 6"
                    />
                  </svg>
                </button>
                
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {index === 0 ? '刚刚' : `${Math.round((Date.now() - item.timestamp) / (1000 * 60))} 分钟前`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
