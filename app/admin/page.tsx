import Link from 'next/link'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import DeletePostButton from '@/components/DeletePostButton'

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 lg:py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm lg:text-base">
              ← Home
            </Link>
            <h1 className="text-lg lg:text-2xl font-bold">Admin Dashboard</h1>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <Link
              href="/admin/posts/new"
              className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 text-sm lg:text-base whitespace-nowrap"
            >
              + New Post
            </Link>

            <form action="/logout" method="post">
              <button
                type="submit"
                className="text-gray-600 hover:text-gray-900 text-sm lg:text-base"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-4 lg:py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base lg:text-lg font-semibold">Your Posts</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {posts.map((post: any) => (
              <div key={post.id} className="px-4 lg:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 text-sm lg:text-base truncate">{post.title}</h3>
                  <div className="text-xs lg:text-sm text-gray-500 mt-1">
                    {format(new Date(post.created_at), 'MMM d, yyyy')} • {' '}
                    <span className={
                      post.status === 'published'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }>
                      {post.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
                  <Link
                    href={`/posts/${post.slug}`}
                    target="_blank"
                    className="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-1 text-sm"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-blue-600 hover:text-blue-800 px-2 lg:px-3 py-1 text-sm"
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
              <div className="px-6 py-12 text-center text-gray-500">
                No posts yet. Create your first post!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}