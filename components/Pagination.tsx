import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    
    // Always show first page
    pages.push(1)
    
    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - 2)
    const rangeEnd = Math.min(totalPages - 1, currentPage + 2)
    
    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push('...')
    }
    
    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }
    
    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push('...')
    }
    
    // Always show last page if different from first
    if (totalPages > 1) {
      pages.push(totalPages)
    }
    
    return pages
  }

  const pages = getPageNumbers()

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      {/* Previous button */}
      {currentPage > 1 ? (
        <Link
          href={`/?page=${currentPage - 1}`}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 
                     text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                     border border-gray-300 dark:border-gray-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 
                        text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-700">
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </span>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-500 dark:text-gray-400">...</span>
            ) : (
              <Link
                href={`/?page=${page}`}
                className={`px-3 py-2 rounded-lg border transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                }`}
              >
                {page}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link
          href={`/?page=${currentPage + 1}`}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 
                     text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                     border border-gray-300 dark:border-gray-600 transition-colors"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 
                        text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-700">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  )
}