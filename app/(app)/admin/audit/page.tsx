import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/server'
import { createAdminClient } from '@/app/lib/supabase/admin'
import type { ProjectAuditEntry } from '@/app/lib/types'

const AUDIT_FIELDS = ['title', 'description', 'genre', 'budget', 'status'] as const

type FieldDiff = { field: string; from: string; to: string }

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'number') return `$${Number(val).toLocaleString()}`
  return String(val)
}

function computeDiff(oldData: Record<string, unknown>, newData: Record<string, unknown>): FieldDiff[] {
  return AUDIT_FIELDS.flatMap((field) => {
    const from = oldData[field]
    const to = newData[field]
    if (from === to) return []
    return [{ field, from: formatValue(from), to: formatValue(to) }]
  })
}

const actionStyles: Record<string, string> = {
  INSERT: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user!.id)
    .single()

  if (!currentProfile?.is_admin) redirect('/dashboard')

  const { userId, page } = await searchParams
  const pageNum = Math.max(1, Number(page ?? 1))
  const pageSize = 50
  const offset = (pageNum - 1) * pageSize

  const adminClient = createAdminClient()

  const { data: { users } } = await adminClient.auth.admin.listUsers()
  const userMap = new Map(
    users.map((u) => [
      u.id,
      {
        email: u.email ?? '',
        name: (u.user_metadata?.full_name as string | undefined) ?? u.email?.split('@')[0] ?? 'Unknown',
      },
    ])
  )

  let query = adminClient
    .from('project_audit')
    .select('*', { count: 'exact' })
    .order('changed_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (userId) {
    query = query.eq('changed_by', userId)
  }

  const { data: entries, count } = await query
  const auditEntries = (entries ?? []) as ProjectAuditEntry[]
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Audit Log</h1>
          <p className="mt-1 text-sm text-zinc-500">All changes to film projects across all users.</p>
        </div>
        <Link href="/admin" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white">
          ← User Management
        </Link>
      </div>

      {/* User filter */}
      <form method="GET" className="mb-6 flex items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 uppercase">Filter by user</label>
          <select
            name="userId"
            defaultValue={userId ?? ''}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          >
            <option value="">All users</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {(u.user_metadata?.full_name as string | undefined) ?? u.email?.split('@')[0]} ({u.email})
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
        >
          Filter
        </button>
        {userId && (
          <Link
            href="/admin/audit"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
          >
            Clear
          </Link>
        )}
      </form>

      {auditEntries.length === 0 ? (
        <p className="text-sm text-zinc-500">No audit entries found.</p>
      ) : (
        <>
          <div className="space-y-2">
            {auditEntries.map((entry) => {
              const actor = entry.changed_by ? userMap.get(entry.changed_by) : null
              const projectTitle =
                (entry.new_data?.title as string | undefined) ??
                (entry.old_data?.title as string | undefined) ??
                'Unknown project'

              let diffs: FieldDiff[] = []
              if (entry.action === 'UPDATE' && entry.old_data && entry.new_data) {
                diffs = computeDiff(entry.old_data, entry.new_data)
              }

              return (
                <div
                  key={entry.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${actionStyles[entry.action]}`}
                      >
                        {entry.action}
                      </span>
                      <span className="text-sm font-medium text-black dark:text-white">
                        {projectTitle}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">
                        {new Date(entry.changed_at).toLocaleString()}
                      </p>
                      {actor ? (
                        <p className="text-xs text-zinc-400">{actor.name} · {actor.email}</p>
                      ) : (
                        <p className="text-xs text-zinc-400">Unknown user</p>
                      )}
                    </div>
                  </div>

                  {entry.action === 'INSERT' && entry.new_data && (
                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-3">
                      {AUDIT_FIELDS.map((field) =>
                        entry.new_data![field] !== null && entry.new_data![field] !== undefined ? (
                          <div key={field}>
                            <span className="text-zinc-400 capitalize">{field}: </span>
                            <span className="text-zinc-700 dark:text-zinc-300">
                              {formatValue(entry.new_data![field])}
                            </span>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}

                  {entry.action === 'UPDATE' && diffs.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {diffs.map((d) => (
                        <div key={d.field} className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="w-20 shrink-0 capitalize text-zinc-400">{d.field}</span>
                          <span className="rounded bg-red-50 px-1.5 py-0.5 font-mono text-red-600 line-through dark:bg-red-900/30 dark:text-red-400">
                            {d.from}
                          </span>
                          <span className="text-zinc-400">→</span>
                          <span className="rounded bg-green-50 px-1.5 py-0.5 font-mono text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {d.to}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {entry.action === 'UPDATE' && diffs.length === 0 && (
                    <p className="mt-2 text-xs text-zinc-400 italic">No tracked field changes.</p>
                  )}

                  {entry.action === 'DELETE' && entry.old_data && (
                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-3">
                      {AUDIT_FIELDS.map((field) =>
                        entry.old_data![field] !== null && entry.old_data![field] !== undefined ? (
                          <div key={field}>
                            <span className="text-zinc-400 capitalize">{field}: </span>
                            <span className="text-red-500 line-through dark:text-red-400">
                              {formatValue(entry.old_data![field])}
                            </span>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                Page {pageNum} of {totalPages} · {count} total entries
              </p>
              <div className="flex gap-2">
                {pageNum > 1 && (
                  <Link
                    href={`/admin/audit?${userId ? `userId=${userId}&` : ''}page=${pageNum - 1}`}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    Previous
                  </Link>
                )}
                {pageNum < totalPages && (
                  <Link
                    href={`/admin/audit?${userId ? `userId=${userId}&` : ''}page=${pageNum + 1}`}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
