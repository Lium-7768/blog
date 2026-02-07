'use client'

import { useState, useEffect } from 'react'

type Heading = {
  id: string
  text: string
  level: number
}

export default function TableOfContents() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [headings, setHeadings] = useState<Heading[]>([])

  useEffect(() => {
    const elements = document.querySelectorAll('article h2, article h3')
    const headingData = Array.from(elements).map((el, index): Heading => ({
      id: `heading-${index}`,
      text: el.textContent || '',
      level: el.tagName.toLowerCase() === 'h2' ? 2 : 3,
    }))
    setHeadings(headingData)

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement
      if (target instanceof HTMLElement) {
        const id = target.getAttribute('data-heading-id')
        if (id) {
          const element = document.getElementById(`heading-${id}`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])

  if (headings.length === 0) {
    return null
  }

  return (
    <div className="fixed top-20 right-4 lg:top-24 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          目录导航
        </h3>
        
        <nav className="space-y-2">
          {headings.map((heading: Heading, index: number) => (
            <a
              key={heading.id}
              href={`#heading-${index}`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const element = document.getElementById(`heading-${index}`)
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              data-heading-id={heading.id}
              aria-label={`Go to ${heading.text}`}
              className={`block px-3 py-2 rounded-lg transition-all duration-200 ${
                activeId === heading.id
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className={`inline-block w-2 h-2 mr-2 rounded-full ${
                heading.level === 2 ? 'bg-blue-600' : 'bg-gray-400'
              }`} />
              <span className="text-sm">
                {heading.text}
              </span>
            </a>
          ))}
        </nav>

        <button
          onClick={() => setActiveId(null)}
          className="lg:hidden mt-4 text-sm text-gray-500 dark:text-gray-400 w-full text-center"
        >
          收起
        </button>
      </div>
    </div>
  )
}
