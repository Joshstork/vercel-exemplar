import { redirect } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { createClient } from '@/app/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name =
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'there'

  return (
    <div className="flex min-h-full items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <main className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Welcome back
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-white">
            {name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
        </div>

        <form>
          <button
            formAction={logout}
            className="rounded-lg border border-zinc-200 px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900"
          >
            Sign out
          </button>
        </form>
      </main>
    </div>
  )
}
