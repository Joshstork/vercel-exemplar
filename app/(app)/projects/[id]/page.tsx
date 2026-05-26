import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/server'
import { trackFunding, updateTrackingStatus, removeTracking, deleteProject } from '@/app/actions/projects'
import type { FilmProject, ProjectFundingWithOpportunity, FundingOpportunity } from '@/app/lib/types'

const statusColors: Record<string, string> = {
  development: 'bg-blue-100 text-blue-700',
  'pre-production': 'bg-yellow-100 text-yellow-700',
  production: 'bg-orange-100 text-orange-700',
  'post-production': 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
}

const trackingColors: Record<string, string> = {
  interested: 'text-zinc-500',
  applied: 'text-blue-600',
  awarded: 'text-green-600',
  rejected: 'text-red-500',
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('film_projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) redirect('/projects')

  const { data: tracked } = await supabase
    .from('project_funding')
    .select('*, funding_opportunities(*)')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  const trackedIds = (tracked ?? []).map((t) => t.opportunity_id)

  let availableQuery = supabase.from('funding_opportunities').select('*').order('title')
  if (trackedIds.length > 0) {
    availableQuery = availableQuery.not('id', 'in', `(${trackedIds.join(',')})`)
  }
  const { data: available } = await availableQuery

  const p = project as FilmProject
  const trackedList = (tracked ?? []) as ProjectFundingWithOpportunity[]
  const availableList = (available ?? []) as FundingOpportunity[]

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/projects" className="mb-6 inline-block text-sm text-zinc-500 hover:text-black dark:hover:text-white">
        ← Back to Projects
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">{p.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {p.genre && <span className="text-sm text-zinc-500">{p.genre}</span>}
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[p.status]}`}>
              {p.status.replace(/-/g, ' ')}
            </span>
            {p.budget && (
              <span className="text-sm text-zinc-500">
                Budget: ${Number(p.budget).toLocaleString()}
              </span>
            )}
          </div>
          {p.description && (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{p.description}</p>
          )}
        </div>

        <form>
          <input type="hidden" name="id" value={id} />
          <button
            formAction={deleteProject}
            className="text-xs text-red-400 hover:text-red-600"
          >
            Delete project
          </button>
        </form>
      </div>

      {/* Tracked funding opportunities */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
          Funding Opportunities ({trackedList.length})
        </h2>

        {trackedList.length > 0 ? (
          <div className="mb-4 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Opportunity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Update</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {trackedList.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-black dark:text-white">
                        {t.funding_opportunities.title}
                      </p>
                      {t.funding_opportunities.source && (
                        <p className="text-xs text-zinc-500">{t.funding_opportunities.source}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-zinc-600 dark:text-zinc-400">
                      {t.funding_opportunities.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {t.funding_opportunities.amount
                        ? `$${Number(t.funding_opportunities.amount).toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium capitalize ${trackingColors[t.status]}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <form className="flex items-center gap-2">
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="project_id" value={id} />
                        <select
                          name="status"
                          defaultValue={t.status}
                          className="rounded border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        >
                          <option value="interested">Interested</option>
                          <option value="applied">Applied</option>
                          <option value="awarded">Awarded</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <button
                          formAction={updateTrackingStatus}
                          className="rounded bg-zinc-100 px-2 py-1 text-xs font-medium hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white"
                        >
                          Save
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form>
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="project_id" value={id} />
                        <button
                          formAction={removeTracking}
                          className="text-xs text-zinc-400 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mb-4 text-sm text-zinc-500">No opportunities tracked yet.</p>
        )}

        {/* Track a new opportunity */}
        {availableList.length > 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-3 text-sm font-medium text-black dark:text-white">Track a Funding Opportunity</h3>
            <form className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="project_id" value={id} />
              <div className="flex-1" style={{ minWidth: '200px' }}>
                <label className="mb-1 block text-xs text-zinc-500">Opportunity</label>
                <select
                  name="opportunity_id"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  {availableList.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Status</label>
                <select
                  name="status"
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="interested">Interested</option>
                  <option value="applied">Applied</option>
                  <option value="awarded">Awarded</option>
                </select>
              </div>
              <button
                formAction={trackFunding}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
              >
                Track
              </button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            All available opportunities are already tracked.{' '}
            <Link href="/funding/new" className="font-medium text-black underline dark:text-white">
              Add a new one
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
