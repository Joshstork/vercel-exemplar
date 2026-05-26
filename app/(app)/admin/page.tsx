import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { setAdminStatus } from '@/app/actions/admin'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user!.id)
    .single()

  if (!currentProfile?.is_admin) redirect('/dashboard')

  const adminClient = createAdminClient()
  const { data: { users } } = await adminClient.auth.admin.listUsers()
  const { data: profiles } = await adminClient.from('profiles').select('user_id, is_admin')

  const profileMap = new Map(profiles?.map((p) => [p.user_id, p.is_admin as boolean]) ?? [])

  const rows = users.map((u) => ({
    id: u.id,
    email: u.email ?? '',
    name: (u.user_metadata?.full_name as string | undefined) ?? u.email?.split('@')[0] ?? 'Unknown',
    is_admin: profileMap.get(u.id) ?? false,
    created_at: u.created_at,
  }))

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-black dark:text-white">User Management</h1>
      <p className="mt-1 mb-6 text-sm text-zinc-500">Grant or revoke admin access for FilmForge users.</p>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-black dark:text-white">{u.name}</p>
                  <p className="text-xs text-zinc-500">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {u.is_admin ? (
                    <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                      Admin
                    </span>
                  ) : (
                    <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800">
                      Producer
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {u.id === user!.id ? (
                    <span className="text-xs text-zinc-400">You</span>
                  ) : (
                    <form>
                      <input type="hidden" name="user_id" value={u.id} />
                      <input type="hidden" name="is_admin" value={String(!u.is_admin)} />
                      <button
                        formAction={setAdminStatus}
                        className={`text-xs font-medium transition-colors ${
                          u.is_admin
                            ? 'text-red-500 hover:text-red-700'
                            : 'text-blue-500 hover:text-blue-700'
                        }`}
                      >
                        {u.is_admin ? 'Remove admin' : 'Make admin'}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
