import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/server'
import type { FilmProject } from '@/app/lib/types'

const statusColors: Record<string, string> = {
  development: 'bg-blue-100 text-blue-700',
  'pre-production': 'bg-yellow-100 text-yellow-700',
  production: 'bg-orange-100 text-orange-700',
  'post-production': 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('film_projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">Film Projects</h1>
        <Link
          href="/projects/new"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
        >
          New Project
        </Link>
      </div>

      {projects && projects.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Genre</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {(projects as FilmProject[]).map((project) => (
                <tr key={project.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/projects/${project.id}`} className="font-medium text-black hover:underline dark:text-white">
                      {project.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{project.genre || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[project.status]}`}>
                      {project.status.replace(/-/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {project.budget ? `$${Number(project.budget).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">No projects yet.</p>
          <Link href="/projects/new" className="mt-2 inline-block text-sm font-medium text-black underline dark:text-white">
            Create your first project
          </Link>
        </div>
      )}
    </div>
  )
}
