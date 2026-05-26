import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/server'
import { createFundingOpportunity } from '@/app/actions/funding'

export default async function NewFundingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('user_id', user!.id).single()
  if (!profile?.is_admin) redirect('/funding')

  const { error } = await searchParams

  return (
    <div className="p-8 max-w-xl">
      <Link href="/funding" className="mb-6 inline-block text-sm text-zinc-500 hover:text-black dark:hover:text-white">
        ← Back to Funding
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-black dark:text-white">New Funding Opportunity</h1>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <form className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            required
            placeholder="Sundance Institute Feature Film Grant"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Details about eligibility, requirements, etc."
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Source</label>
          <input
            name="source"
            placeholder="Sundance Institute"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
            <select
              name="type"
              defaultValue="grant"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              <option value="grant">Grant</option>
              <option value="investment">Investment</option>
              <option value="loan">Loan</option>
              <option value="equity">Equity</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Amount (USD)</label>
            <input
              name="amount"
              type="number"
              min="0"
              placeholder="25000"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Deadline</label>
          <input
            name="deadline"
            type="date"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            formAction={createFundingOpportunity}
            className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
          >
            Create Opportunity
          </button>
          <Link
            href="/funding"
            className="rounded-lg border border-zinc-200 px-5 py-2 text-sm font-medium text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-white"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
