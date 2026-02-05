// lib/supabase-server.ts - 用于 Server Components
import { createClient } from '@supabase/supabase-js'

// 只在运行时创建客户端，避免构建时错误
export function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // 返回模拟数据或抛出错误
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}