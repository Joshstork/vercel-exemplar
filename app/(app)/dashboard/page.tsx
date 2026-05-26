import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const name = (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || 'Producer'

  const [{ count: projectCount }, { count: fundingCount }] = await Promise.all([
    supabase.from('film_projects').select('*', { count: 'exact', head: true }),
    supabase.from('project_funding').select('*', { count: 'exact', head: true }),
  ])

  const { data: recentProjects } = await supabase
    .from('film_projects')
    .select('id, title, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const statusColors: Record<string, string> = {
    development: 'bg-blue-100 text-blue-700',
    'pre-production': 'bg-yellow-100 text-yellow-700',
    production: 'bg-orange-100 text-orange-700',
    'post-production': 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-black dark:text-white">
        Welcome back, {name}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">Here&apos;s an overview of your slate.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Projects</p>
          <p className="mt-1 text-3xl font-bold text-black dark:text-white">{projectCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Tracked Opportunities</p>
          <p className="mt-1 text-3xl font-bold text-black dark:text-white">{fundingCount ?? 0}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/projects/new"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
        >
          New Project
        </Link>
        <Link
          href="/funding"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900"
        >
          Browse Funding
        </Link>
      </div>

      {recentProjects && recentProjects.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-black dark:text-white">Recent Projects</h2>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full">
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <Link href={`/projects/${p.id}`} className="text-sm font-medium text-black hover:underline dark:text-white">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[p.status]}`}>
                        {p.status.replace(/-/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
