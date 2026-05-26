import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/server'

const features = [
  {
    title: 'Project Pipeline',
    description:
      'Organize your films from development through distribution. Track progress, manage budgets, and keep your entire project portfolio visible at a glance. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
  },
  {
    title: 'Funding Intelligence',
    description:
      'Discover grants, investments, and financing opportunities from a shared database. Track applications, monitor deadlines, and log award outcomes across every project you manage. Ut enim ad minim veniam, quis nostrud exercitation.',
  },
  {
    title: 'Producer Dashboard',
    description:
      'Get a real-time view of your entire slate. Monitor project statuses, funding progress, and upcoming deadlines from one central hub built for the working independent producer. Duis aute irure dolor in reprehenderit.',
  },
]

const steps = [
  { number: '01', title: 'Create a project', body: 'Add your film project with genre, budget, and production status. Keep everything about your slate in one place.' },
  { number: '02', title: 'Find funding', body: 'Browse the shared database of grants, investments, and financing. Add new opportunities that you discover along the way.' },
  { number: '03', title: 'Track applications', body: 'Link opportunities to your projects and update their status as you move from interested to applied to awarded.' },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="min-h-full bg-white dark:bg-black">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-10">
            <span className="text-lg font-bold text-black dark:text-white">FilmForge</span>
            <nav className="hidden gap-6 md:flex">
              <a href="#features" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white">Features</a>
              <a href="#how-it-works" className="text-sm text-zinc-500 hover:text-black dark:hover:text-white">How it works</a>
            </nav>
          </div>

          {session ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                Sign in
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">Independent Film Production</p>
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-black dark:text-white md:text-6xl">
          The platform built<br />for independent producers
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
          FilmForge brings your entire production workflow into one place — project management, funding tracking, and the tools modern filmmakers actually need.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
          >
            Start for free
          </Link>
          <a
            href="#how-it-works"
            className="rounded-lg border border-zinc-200 px-6 py-3 text-sm font-medium text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900"
          >
            See how it works
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-zinc-50 py-24 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-3 text-center text-3xl font-bold text-black dark:text-white">
            Everything you need to produce
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center text-zinc-500 dark:text-zinc-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-black">
                <h3 className="mb-2 font-semibold text-black dark:text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-16 text-center text-3xl font-bold text-black dark:text-white">How it works</h2>
          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.number}>
                <span className="mb-4 block text-4xl font-bold text-zinc-100 dark:text-zinc-800">{s.number}</span>
                <h3 className="mb-2 font-semibold text-black dark:text-white">{s.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black py-24 dark:bg-zinc-900">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">Ready to bring your story to life?</h2>
          <p className="mb-8 text-zinc-400">
            Join producers who are using FilmForge to manage their slates and track funding from development to distribution.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-white px-6 py-3 text-sm font-medium text-black hover:bg-zinc-100"
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <span className="text-sm font-semibold text-black dark:text-white">FilmForge</span>
          <p className="text-xs text-zinc-400">© {new Date().getFullYear()} FilmForge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
