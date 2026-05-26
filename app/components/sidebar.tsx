import Link from 'next/link'
import { SidebarLink } from './sidebar-link'
import { logout } from '@/app/actions/auth'
import type { User } from '@supabase/supabase-js'

const baseNavItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/projects', label: 'Film Projects' },
  { href: '/funding', label: 'Funding' },
]

export function Sidebar({ user, isAdmin }: { user: User; isAdmin: boolean }) {
  const name = (user.user_metadata?.full_name as string | undefined) || user.email?.split('@')[0] || 'Producer'
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const navItems = isAdmin
    ? [...baseNavItems, { href: '/admin', label: 'Admin' }]
    : baseNavItems

  return (
    <div className="flex h-full w-56 flex-shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 p-5 dark:border-zinc-800">
        <Link href="/dashboard" className="text-lg font-bold text-black dark:text-white">
          FilmForge
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => (
          <SidebarLink key={item.href} href={item.href}>
            {item.label}
          </SidebarLink>
        ))}
      </nav>

      <div className="border-t border-zinc-100 p-4 dark:border-zinc-800">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-black dark:text-white">{name}</p>
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          </div>
        </div>
        {isAdmin && (
          <p className="mb-2 text-xs font-medium text-amber-600 dark:text-amber-400">Admin</p>
        )}
        <form>
          <button
            formAction={logout}
            className="w-full text-left text-xs text-zinc-400 transition-colors hover:text-black dark:hover:text-white"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}
