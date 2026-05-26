import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { Sidebar } from '@/app/components/sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  const isAdmin = profile?.is_admin ?? false

  return (
    <div className="flex h-full">
      <Sidebar user={user} isAdmin={isAdmin} />
      <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
        {children}
      </main>
    </div>
  )
}
