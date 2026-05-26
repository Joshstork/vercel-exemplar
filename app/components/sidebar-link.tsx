'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white'
          : 'text-zinc-500 hover:text-black hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800'
      }`}
    >
      {children}
    </Link>
  )
}
