'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  let theme = 'system' as 'light' | 'dark' | 'system'
  let setTheme = (_: 'light' | 'dark' | 'system') => {}
  let resolvedTheme = 'light' as 'light' | 'dark'

  try {
    const themeContext = useTheme()
    theme = themeContext.theme
    setTheme = themeContext.setTheme
    resolvedTheme = themeContext.resolvedTheme
  } catch {
    // During SSR/SSG, ThemeProvider is not available
    // Show system theme as default
  }

  const themes: { value: typeof theme; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ]

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 transition-colors">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-2 rounded-md transition-all duration-200 ${
            theme === value
              ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
          title={label}
          aria-label={`Switch to ${label} mode`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}