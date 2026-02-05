'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Define database types
type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          cover_image: string | null
          status: 'draft' | 'published'
          author_id: string
          category_id: string | null
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          cover_image?: string | null
          status?: 'draft' | 'published'
          author_id: string
          category_id?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          cover_image?: string | null
          status?: 'draft' | 'published'
          author_id?: string
          category_id?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
      }
      profiles: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          role: 'user' | 'admin'
          created_at: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          post_id: string
          author_id: string
          parent_id: string | null
          status: 'pending' | 'approved' | 'spam'
          created_at: string
        }
      }
    }
  }
}

// Client-side singleton
let client: ReturnType<typeof createClient<Database>> | null = null

export function getClient() {
  if (!client) {
    client = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  return client
}

// Server-side client (for Server Components)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const auth = {
  signUp: (email: string, password: string, name: string) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    }),

  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: () => supabase.auth.signOut(),

  getUser: () => supabase.auth.getUser(),

  getSession: () => supabase.auth.getSession(),
}

// Database helpers
export const db = {
  // Posts
  posts: {
    getAll: async (filters?: { category?: string; status?: string }) => {
      let query = supabase
        .from('posts')
        .select('*, category:categories(*), author:profiles(name)')
        .order('created_at', { ascending: false })
      
      if (filters?.category) {
        query = query.eq('category.slug', filters.category)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      } else {
        query = query.eq('status', 'published')
      }
      
      return await query
    },

    getBySlug: async (slug: string) => {
      return await supabase
        .from('posts')
        .select('*, category:categories(*), author:profiles(name)')
        .eq('slug', slug)
        .single()
    },

    create: async (post: any) => {
      return await (supabase
        .from('posts') as any)
        .insert(post)
        .select()
        .single()
    },

    update: async (id: string, post: any) => {
      return await (supabase
        .from('posts') as any)
        .update(post)
        .eq('id', id)
        .select()
        .single()
    },

    delete: async (id: string) => {
      return await supabase.from('posts').delete().eq('id', id)
    },

    incrementViews: async (id: string) => {
      return await (supabase.rpc as any)('increment_post_views', { post_id: id })
    }
  },

  // Categories
  categories: {
    getAll: async () => {
      return await supabase.from('categories').select('*').order('name')
    }
  },

  // Comments
  comments: {
    getByPost: async (postId: string) => {
      return await supabase
        .from('comments')
        .select('*, author:profiles(name)')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
    },

    create: async (comment: any) => {
      return await supabase.from('comments').insert(comment).select().single()
    }
  },

  // Profiles
  profiles: {
    getById: async (id: string) => {
      return await supabase.from('profiles').select('*').eq('id', id).single()
    },

    update: async (id: string, data: any) => {
      return await (supabase.from('profiles') as any).update(data).eq('id', id)
    }
  }
}