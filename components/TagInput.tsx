'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Plus, Tag as TagIcon } from 'lucide-react'

interface Tag {
  id: string
  name: string
  slug: string
  color: string
}

interface TagInputProps {
  selectedTags: string[] // Array of tag IDs
  onChange: (tagIds: string[]) => void
}

export default function TagInput({ selectedTags, onChange }: TagInputProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Load available tags
  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const response = await fetch('/api/tags')
      const data = await response.json()
      if (data.tags) {
        setAvailableTags(data.tags)
      }
    } catch (error) {
      console.error('Failed to load tags:', error)
    }
  }

  // Get selected tag objects
  const selectedTagObjects = availableTags.filter((tag) =>
    selectedTags.includes(tag.id)
  )

  // Filter available tags for dropdown
  const filteredTags = availableTags.filter(
    (tag) =>
      !selectedTags.includes(tag.id) &&
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
  )

  const handleAddTag = (tagId: string) => {
    onChange([...selectedTags, tagId])
    setInputValue('')
    setShowDropdown(false)
  }

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTags.filter((id) => id !== tagId))
  }

  const handleCreateTag = async () => {
    if (!inputValue.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inputValue.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        // Add new tag to available tags and select it
        setAvailableTags([...availableTags, data.tag])
        onChange([...selectedTags, data.tag.id])
        setInputValue('')
        setShowDropdown(false)
      } else if (response.status === 409) {
        // Tag already exists, find and select it
        const existingTag = availableTags.find(
          (t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()
        )
        if (existingTag && !selectedTags.includes(existingTag.id)) {
          onChange([...selectedTags, existingTag.id])
          setInputValue('')
          setShowDropdown(false)
        }
      }
    } catch (error) {
      console.error('Failed to create tag:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Tags
      </label>

      {/* Selected Tags */}
      {selectedTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTagObjects.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="hover:bg-white/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
        >
          <TagIcon className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Add tags..."
            className="flex-1 outline-none text-sm"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleCreateTag}
              disabled={isLoading}
              className="ml-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && (inputValue || filteredTags.length > 0) && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
              {filteredTags.length > 0 ? (
                <ul className="py-1">
                  {filteredTags.map((tag) => (
                    <li
                      key={tag.id}
                      onClick={() => handleAddTag(tag.id)}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                    </li>
                  ))}
                </ul>
              ) : inputValue ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Press + to create &quot;{inputValue}&quot;
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Type to search tags, or create a new one with the + button
      </p>
    </div>
  )
}