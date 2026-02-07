'use client'

import { useState, useEffect } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const winHeight = window.innerHeight

      // 计算滚动进度
      const scrollPercentage = Math.min(
        Math.max(0, (scrollTop / (docHeight - winHeight)) * 100),
        100
      )

      setProgress(scrollPercentage)
    }

    // 使用 requestAnimationFrame 优化性能
    let ticking = false
    const rafScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', rafScroll)

    return () => {
      window.removeEventListener('scroll', rafScroll)
    }
  }, [])

  if (progress === 0) {
    return null
  }

  return (
    <>
      {/* 进度条 */}
      <div className="fixed top-0 left-0 right-0 h-1 w-full z-50 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 进度指示器 */}
      <div className="fixed top-1 right-4 bg-blue-600 dark:bg-blue-500 text-white text-xs px-3 py-1 rounded-full shadow-lg z-50 transition-transform duration-150">
        {Math.round(progress)}%
      </div>
    </>
  )
}
