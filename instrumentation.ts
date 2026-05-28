export async function register() {
  if (process.env.NODE_ENV !== 'development') return

  const originalFetch = globalThis.fetch

  globalThis.fetch = async (url, init) => {
    try {
      return await originalFetch(url, init)
    } catch (err) {
      const cause = (err as { cause?: NodeJS.ErrnoException }).cause
      if (cause?.code === 'ECONNREFUSED') {
        const addr = `${cause.address}:${cause.port}`
        const isSupabase =
          addr === '127.0.0.1:54321' ||
          String(url).includes(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '__never__')

        if (isSupabase) {
          console.error(
            `\n⚠️  Cannot connect to Supabase (${addr}).\n` +
            `   Make sure Docker Desktop is running, then: npx supabase start\n`
          )
        } else {
          console.error(`\n⚠️  fetch failed: connection refused to ${addr}\n`)
        }
      }
      throw err
    }
  }
}
