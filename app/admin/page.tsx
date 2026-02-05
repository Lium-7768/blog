import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { format } from 'date-fns'

export default async function AdminPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', session.user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Home
            </Link>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/admin/posts/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + New Post
            </Link>

            <form action="/logout" method="post">
              <button
                type="submit"
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Your Posts</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {posts?.map((post: any) => (
              <div key={post.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{post.title}</h3>
                  <div className="text-sm text-gray-500 mt-1">
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

                <div className="flex items-center space-x-2">
                  <Link
                    href={`/posts/${post.slug}`}
                    target="_blank"
                    className="text-gray-600 hover:text-gray-900 px-3 py-1"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}

            {(!posts || posts.length === 0) && (
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