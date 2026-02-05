import Link from 'next/link'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import DeletePostButton from '@/components/DeletePostButton'
import ThemeToggle from '@/components/ThemeToggle'

async function getUserPosts() {
  try {
    const { getServerClient } = await import('@/lib/supabase-server')
    const supabase = getServerClient()
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { posts: [], user: null }
    }

    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', session.user.id)
      .order('created_at', { ascending: false })

    return { posts: posts || [], user: session.user }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return { posts: [], user: null }
  }
}

export default async function AdminPage() {
  const { posts, user } = await getUserPosts()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 py-3 lg:py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm lg:text-base transition-colors">
              ← Home
            </Link>
            <h1 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white transition-colors">Admin Dashboard</h1>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <ThemeToggle />
            <Link
              href="/admin/posts/new"
              className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 text-sm lg:text-base whitespace-nowrap transition-colors"
            >
              + New Post
            </Link>

            <form action="/logout" method="post">
              <button
                type="submit"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm lg:text-base transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-4 lg:py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-200">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700 transition-colors">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white transition-colors">Your Posts</h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
            {posts.map((post: any) => (
              <div key={post.id} className="px-4 lg:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm lg:text-base truncate transition-colors">{post.title}</h3>
                  <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                    {format(new Date(post.created_at), 'MMM d, yyyy')} • {' '}
                    <span className={
                      post.status === 'published'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    }>
                      {post.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
                  <Link
                    href={`/posts/${post.slug}`}
                    target="_blank"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 lg:px-3 py-1 text-sm transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2 lg:px-3 py-1 text-sm transition-colors"
                  >
                    Edit
                  </Link>
                  <DeletePostButton 
                    postId={post.id} 
                    postTitle={post.title} 
                  />
                </div>
              </div>
            ))}

            {posts.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 transition-colors">
                No posts yet. Create your first post!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}