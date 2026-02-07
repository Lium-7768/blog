'use client'

export default function PostSkeleton() {
  return (
    <div className="animate-all card-fade-in space-y-4">
      {/* 模拟标题 */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />

      {/* 模拟内容段落 */}
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  )
}
