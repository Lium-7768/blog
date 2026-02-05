import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  await supabase.auth.signOut()

  redirect('/')
}