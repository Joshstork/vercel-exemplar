import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/server'
import { ProjectSelector } from './project-selector'
import type { FundingOpportunity } from '@/app/lib/types'

const statusColors: Record<string, string> = {
  development: 'bg-blue-100 text-blue-700',
  'pre-production': 'bg-yellow-100 text-yellow-700',
  production: 'bg-orange-100 text-orange-700',
  'post-production': 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
}

const typeColors: Record<string, string> = {
  grant: 'bg-green-100 text-green-700',
  investment: 'bg-blue-100 text-blue-700',
  loan: 'bg-yellow-100 text-yellow-700',
  equity: 'bg-purple-100 text-purple-700',
  other: 'bg-zinc-100 text-zinc-700',
}

function scoreColor(score: number) {
  if (score >= 67) return 'text-green-600'
  if (score >= 34) return 'text-yellow-600'
  return 'text-red-500'
}

function scoreBarColor(score: number) {
  if (score >= 67) return 'bg-green-500'
  if (score >= 34) return 'bg-yellow-400'
  return 'bg-red-400'
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const { project: selectedProjectId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const name = (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || 'Producer'

  const [
    { count: projectCount },
    { count: fundingCount },
    { data: projects },
    { data: opportunities },
  ] = await Promise.all([
    supabase.from('film_projects').select('*', { count: 'exact', head: true }),
    supabase.from('project_funding').select('*', { count: 'exact', head: true }),
    supabase.from('film_projects').select('id, title, status').order('created_at', { ascending: false }),
    supabase.from('funding_opportunities').select('*').eq('is_active', true).order('created_at', { ascending: false }),
  ])

  const projectList = projects ?? []
  const activeProject = selectedProjectId
    ? projectList.find((p) => p.id === selectedProjectId) ?? projectList[0]
    : projectList[0]

  const { data: matchScores } = activeProject
    ? await supabase
        .from('project_match_scores')
        .select('opportunity_id, score')
        .eq('project_id', activeProject.id)
    : { data: [] }

  const scoreMap = new Map((matchScores ?? []).map((s) => [s.opportunity_id, s.score]))

  const opportunitiesWithScores = ((opportunities ?? []) as FundingOpportunity[])
    .map((o) => ({ ...o, score: scoreMap.get(o.id) ?? null }))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))

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

      {projectList.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-4">
            <h2 className="text-sm font-semibold text-black dark:text-white">Match Scores</h2>
            <ProjectSelector projects={projectList} selectedId={activeProject?.id ?? null} />
          </div>

          {opportunitiesWithScores.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Opportunity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 w-48">Match Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {opportunitiesWithScores.map((o) => (
                    <tr key={o.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-black dark:text-white">{o.title}</p>
                        {o.source && <p className="mt-0.5 text-xs text-zinc-500">{o.source}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeColors[o.type]}`}>
                          {o.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                        {o.amount ? `$${Number(o.amount).toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {o.score !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                              <div
                                className={`h-full rounded-full ${scoreBarColor(o.score)}`}
                                style={{ width: `${o.score}%` }}
                              />
                            </div>
                            <span className={`text-sm font-semibold tabular-nums ${scoreColor(o.score)}`}>
                              {o.score}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">Not scored</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-white py-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500">No active funding opportunities to score against.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
