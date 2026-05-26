'use client'

import { useState } from 'react'
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
  const [mobileOpen, setMobileOpen] = useState(false)

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

  const sidebarContent = (
    <div className="flex h-full w-56 flex-shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-100 p-5 dark:border-zinc-800">
        <Link href="/dashboard" className="text-lg font-bold text-black dark:text-white" onClick={() => setMobileOpen(false)}>
          FilmForge
        </Link>
        <button
          className="md:hidden text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => (
          <div key={item.href} onClick={() => setMobileOpen(false)}>
            <SidebarLink href={item.href}>{item.label}</SidebarLink>
          </div>
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

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex h-14 items-center gap-3 border-b border-zinc-200 bg-white px-4 md:hidden dark:border-zinc-800 dark:bg-zinc-900">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/dashboard" className="text-base font-bold text-black dark:text-white">
          FilmForge
        </Link>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden h-full md:flex">
        {sidebarContent}
      </div>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 h-full transition-transform duration-200 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  )
}
