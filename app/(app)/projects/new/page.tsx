import Link from 'next/link'
import { createProject } from '@/app/actions/projects'

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="p-8 max-w-xl">
      <Link href="/projects" className="mb-6 inline-block text-sm text-zinc-500 hover:text-black dark:hover:text-white">
        ← Back to Projects
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-black dark:text-white">New Film Project</h1>

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
            placeholder="My Feature Film"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
          <textarea
            name="description"
            rows={3}
            placeholder="A brief synopsis of your project..."
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Genre</label>
            <input
              name="genre"
              placeholder="Drama, Thriller..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Budget (USD)</label>
            <input
              name="budget"
              type="number"
              min="0"
              placeholder="500000"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
          <select
            name="status"
            defaultValue="development"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          >
            <option value="development">Development</option>
            <option value="pre-production">Pre-Production</option>
            <option value="production">Production</option>
            <option value="post-production">Post-Production</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            formAction={createProject}
            className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
          >
            Create Project
          </button>
          <Link
            href="/projects"
            className="rounded-lg border border-zinc-200 px-5 py-2 text-sm font-medium text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-white"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
