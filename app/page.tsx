import Link from 'next/link'
import { format } from 'date-fns'
import SearchBar from '@/components/SearchBar'
import TagCloud from '@/components/TagCloud'
import MobileNav from '@/components/MobileNav'

// 模拟数据，避免构建时出错
const mockPosts = [
  {
    id: '1',
    title: 'Welcome to My Blog',
    slug: 'welcome',
    excerpt: 'This is a sample blog post. Create your first post in the admin panel!',
    created_at: new Date().toISOString(),
    view_count: 0,
    author: { name: 'Admin' },
    category: { name: 'General', slug: 'general' }
  }
]

async function getPosts() {
  try {
    // 动态导入，避免构建时加载
    const { getServerClient } = await import('@/lib/supabase-server')
    const supabase = getServerClient()
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*, category:categories(*), author:profiles(name)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return posts || []
  } catch (error) {
    console.error('Error fetching posts:', error)
    // 返回模拟数据或空数组
    return []
  }
}

export default async function Home() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 lg:py-6 flex justify-between items-center">
          <Link href="/" className="text-xl lg:text-2xl font-bold text-gray-900">
            My Blog
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900 px-3 py-2">
              Admin
            </Link>
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 lg:py-12">
        {/* Search Section */}
        <div className="mb-6 lg:mb-12">
          <SearchBar />
        </div>

        <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-6 lg:mb-8">Latest Posts</h1>

        {/* Tag Cloud */}
        <div className="mb-6 lg:mb-8">
          <TagCloud />
        </div>

        <div className="space-y-4 lg:space-y-8">
          {posts.map((post: any) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition"
            >
              <Link href={`/posts/${post.slug}`}>
                <h2 className="text-lg lg:text-2xl font-semibold text-gray-900 mb-2 hover:text-blue-600 line-clamp-2">
                  {post.title}
                </h2>
              </Link>

              <p className="text-gray-600 mb-4 text-sm lg:text-base line-clamp-3">{post.excerpt}</p>

              <div className="flex flex-wrap items-center text-xs lg:text-sm text-gray-500 gap-x-4 gap-y-1">
                <span>{post.author?.name || 'Unknown'}</span>
                <span>•</span>
                <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                {post.category && (
                  <>
                    <span>•</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {post.category.name}
                    </span>
                  </>
                )}
              </div>
            </article>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No posts yet. Create one in the admin panel!</p>
              <Link
                href="/admin"
                className="inline-block mt-4 text-blue-600 hover:underline"
              >
                Go to Admin →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}