import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/server'
import { deleteFundingOpportunity } from '@/app/actions/funding'
import type { FundingOpportunity } from '@/app/lib/types'

const typeColors: Record<string, string> = {
  grant: 'bg-green-100 text-green-700',
  investment: 'bg-blue-100 text-blue-700',
  loan: 'bg-yellow-100 text-yellow-700',
  equity: 'bg-purple-100 text-purple-700',
  other: 'bg-zinc-100 text-zinc-700',
}

export default async function FundingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: opportunities }, { data: profile }] = await Promise.all([
    supabase.from('funding_opportunities').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('is_admin').eq('user_id', user!.id).single(),
  ])

  const isAdmin = profile?.is_admin ?? false

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black dark:text-white">Funding Opportunities</h1>
        {isAdmin && (
          <Link
            href="/funding/new"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
          >
            New Opportunity
          </Link>
        )}
      </div>

      {opportunities && opportunities.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Deadline</th>
                {isAdmin && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {(opportunities as FundingOpportunity[]).map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-black dark:text-white">{o.title}</p>
                    {o.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{o.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeColors[o.type]}`}>
                      {o.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {o.amount ? `$${Number(o.amount).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{o.source || '—'}</td>
                  <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {o.deadline ? new Date(o.deadline).toLocaleDateString() : '—'}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/funding/${o.id}/edit`}
                          className="text-xs text-zinc-500 hover:text-black dark:hover:text-white"
                        >
                          Edit
                        </Link>
                        <form>
                          <input type="hidden" name="id" value={o.id} />
                          <button
                            formAction={deleteFundingOpportunity}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">No funding opportunities yet.</p>
          {isAdmin && (
            <Link href="/funding/new" className="mt-2 inline-block text-sm font-medium text-black underline dark:text-white">
              Add the first one
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
