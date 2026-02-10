import type { Metadata } from 'next'
import './globals.css'
import './animations.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import BackToTop from '@/components/BackToTop'

export const metadata: Metadata = {
  title: 'My Blog',
  description: 'A blog built with Next.js and Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <ThemeProvider>
          <BackToTop />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
