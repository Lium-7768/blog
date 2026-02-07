'use client'

import { useState } from 'react'
import { Share2, Link as LinkIcon, Facebook, Twitter, Linkedin, Copy, Check } from 'lucide-react'

interface SocialShareProps {
  title: string
  url: string
  description?: string
  tags?: string[]
}

export default function SocialShare({
  title,
  url,
  description = '',
  tags = []
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setShowTooltip(true)

      setTimeout(() => {
        setShowTooltip(false)
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} ${url}`)}`
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`
    window.open(facebookUrl, '_blank', 'noopener,noreferrer')
  }

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer')
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        })
      } catch (error) {
        console.error('Native share failed:', error)
      }
    }
  }

  const canNativeShare = typeof navigator.share !== 'undefined'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative group">
        <button
          onClick={handleCopyLink}
          type="button"
          aria-label={copied ? 'Link copied!' : 'Copy link to clipboard'}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 
                     hover:bg-gray-200 dark:hover:bg-gray-600 
                     transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" aria-hidden="true" />
          ) : (
            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" aria-hidden="true" />
          )}
          
          {showTooltip && (
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 
                                bg-gray-900 text-white text-xs px-2 py-1 
                                rounded shadow-lg whitespace-nowrap 
                                transition-all duration-200 z-10">
              {copied ? '已复制！' : '复制链接'}
            </span>
          )}
        </button>
      </div>

      {/* Twitter Share */}
      <div className="relative group">
        <button
          onClick={handleTwitterShare}
          type="button"
          aria-label="Share on Twitter"
          className="p-2 rounded-lg bg-[#1DA1F2] hover:bg-[#1a91db] 
                     transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Twitter className="w-4 h-4 text-white" aria-hidden="true" />
        </button>
      </div>

      {/* Facebook Share */}
      <div className="relative group">
        <button
          onClick={handleFacebookShare}
          type="button"
          aria-label="Share on Facebook"
          className="p-2 rounded-lg bg-[#1877F2] hover:bg-[#0d65d6] 
                     transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Facebook className="w-4 h-4 text-white" aria-hidden="true" />
        </button>
      </div>

      {/* LinkedIn Share */}
      <div className="relative group">
        <button
          onClick={handleLinkedInShare}
          type="button"
          aria-label="Share on LinkedIn"
          className="p-2 rounded-lg bg-[#0077b5] hover:bg-[#006685] 
                     transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Linkedin className="w-4 h-4 text-white" aria-hidden="true" />
        </button>
      </div>

      {/* Native Share (for mobile) */}
      {canNativeShare && (
        <div className="relative group sm:hidden">
          <button
            onClick={handleNativeShare}
            type="button"
            aria-label="Share"
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 
                           text-white
                           transition-all duration-200
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Tags for context */}
      {tags && tags.length > 0 && (
        <div className="hidden lg:flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 ml-4">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              #{tag.name}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-gray-400">+{tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  )
}
