import { NextRequest } from 'next/server'
import { createAdminClient } from '@/app/lib/supabase/admin'

export async function POST(req: NextRequest) {
  if (req.headers.get('x-internal-secret') !== process.env.INTERNAL_API_SECRET) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { type, id } = await req.json()
  console.log(`[match-scores] calculating for ${type} ${id}`)
  const supabase = createAdminClient()

  if (type === 'project') {
    const { data: opportunities } = await supabase
      .from('funding_opportunities')
      .select('id')
      .eq('is_active', true)

    const rows = (opportunities ?? []).map((o: { id: string }) => ({
      project_id: id,
      opportunity_id: o.id,
      score: Math.floor(Math.random() * 101),
      calculated_at: new Date().toISOString(),
    }))

    if (rows.length > 0) {
      await supabase
        .from('project_match_scores')
        .upsert(rows, { onConflict: 'project_id,opportunity_id' })
    }
    console.log(`[match-scores] upserted ${rows.length} scores for project ${id}`)
  } else if (type === 'opportunity') {
    const { data: projects } = await supabase
      .from('film_projects')
      .select('id')

    const rows = (projects ?? []).map((p: { id: string }) => ({
      project_id: p.id,
      opportunity_id: id,
      score: Math.floor(Math.random() * 101),
      calculated_at: new Date().toISOString(),
    }))

    if (rows.length > 0) {
      await supabase
        .from('project_match_scores')
        .upsert(rows, { onConflict: 'project_id,opportunity_id' })
    }
    console.log(`[match-scores] upserted ${rows.length} scores for opportunity ${id}`)
  }

  return Response.json({ ok: true })
}
