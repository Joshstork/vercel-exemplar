'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type Project = { id: string; title: string }

export function ProjectSelector({ projects, selectedId }: { projects: Project[]; selectedId: string | null }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('project', e.target.value)
    router.push(`/dashboard?${params.toString()}`)
  }

  if (projects.length === 0) return null

  return (
    <select
      value={selectedId ?? ''}
      onChange={onChange}
      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
    >
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.title}
        </option>
      ))}
    </select>
  )
}
