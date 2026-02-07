'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setHasScrolled(scrollTop > 300)

      if (scrollTop > 500) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    const handleScrollRequest = () => {
      window.requestAnimationFrame(handleScroll)
    }

    window.addEventListener('scroll', handleScrollRequest)

    return () => {
      window.removeEventListener('scroll', handleScrollRequest)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      onClick={scrollToTop}
      type="button"
      aria-label="Scroll to top"
      className={`
        fixed bottom-6 right-6
        w-12 h-12 rounded-full
        bg-blue-600 dark:bg-blue-500
        text-white
        shadow-lg
        transition-all duration-300
        ${isVisible ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95 translate-y-4'}
        ${hasScrolled ? 'hover:bg-blue-700 dark:hover:bg-blue-600' : 'opacity-50'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
    >
      <ArrowUp className="w-5 h-5" aria-hidden="true" />
      <span className="sr-only">返回顶部</span>
    </button>
  )
}
