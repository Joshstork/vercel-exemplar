import 'server-only'

export async function triggerMatchScores(type: 'project' | 'opportunity', id: string) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  console.log(`[match-scores] triggering for ${type} ${id}`)
  const res = await fetch(`${base}/api/match-scores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '',
    },
    body: JSON.stringify({ type, id }),
  })
  console.log(`[match-scores] response ${res.status} for ${type} ${id}`)
}
