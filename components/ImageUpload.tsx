'use client'

import { useState, useCallback } from 'react'
import { ImagePlus, X, Loader2, Upload as UploadIcon } from 'lucide-react'

interface ImageUploadProps {
  onUpload: (url: string, type: 'cover' | 'gallery') => void
  initialUrl?: string
  initialType?: 'cover' | 'gallery'
}

export default function ImageUpload({ onUpload, initialUrl, initialType }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(initialUrl || null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [type, setType] = useState<'cover' | 'gallery'>(initialType || 'cover')
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.')
      return
    }

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP, GIF)')
      return
    }

    setFile(selectedFile)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      setFile(droppedFile)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(droppedFile)
    }
    setDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    try {
      // Upload to Supabase Storage
      const { getClient } = await import('@/lib/supabase')
      const supabase = getClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('Please login to upload images')
        return
      }

      const timestamp = Date.now()
      const ext = file.name.split('.').pop()
      const uniqueFilename = `${user.id}/${timestamp}.${ext}`

      const { data, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(uniqueFilename, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = await supabase.storage
        .from('blog-images')
        .getPublicUrl(uniqueFilename)

      if (!publicUrl) {
        throw new Error('Failed to get public URL')
      }

      // Determine full URL
      const fullUrl = `${publicUrl}${type === 'gallery' ? '-thumb' : ''}`

      setUploadProgress(100)
      
      // Call parent callback
      onUpload(fullUrl, type)
      
      // Clean up
      setTimeout(() => {
        setFile(null)
        setPreview(null)
        setUploadProgress(0)
      }, 500)
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    if (!initialUrl) return
    
    if (!confirm('Are you sure you want to remove this image?')) {
      return
    }

    onUpload('', type)
    setPreview(null)
    setFile(null)
  }

  return (
    <div className="space-y-4">
      {/* Type Selector */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setType('cover')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            type === 'cover' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Cover Image
        </button>
        <button
          type="button"
          onClick={() => setType('gallery')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            type === 'gallery' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Gallery Image
        </button>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center
          transition-all duration-200
          ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:bg-gray-800'}
          ${uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          onChange={handleFileChange}
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={uploading}
        />

        {preview || initialUrl ? (
          <div className="space-y-4">
            <img
              src={preview || initialUrl}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg shadow-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4" />
                    Upload
                  </>
                )}
              </button>

              {preview && (
                <button
                  onClick={handleRemove}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <ImagePlus className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {uploading 
                ? 'Uploading...' 
                : 'Drag and drop or click to upload'
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Supports: JPEG, PNG, WebP, GIF (max 5MB)
            </p>
            <button
              onClick={() => document.getElementById('file-input')?.click()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              Choose File
            </button>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
    </div>
  )
}