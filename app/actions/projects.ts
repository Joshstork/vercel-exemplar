'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/lib/supabase/server'
import { triggerMatchScores } from '@/app/lib/trigger-match-scores'

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase.from('film_projects').insert({
    user_id: user.id,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    genre: (formData.get('genre') as string) || null,
    budget: formData.get('budget') ? Number(formData.get('budget')) : null,
    status: (formData.get('status') as string) || 'development',
  }).select('id').single()

  if (error) redirect('/projects/new?error=' + encodeURIComponent(error.message))
  await triggerMatchScores('project', data.id)
  redirect('/projects')
}

export async function updateProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string

  const { error } = await supabase
    .from('film_projects')
    .update({
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      genre: (formData.get('genre') as string) || null,
      budget: formData.get('budget') ? Number(formData.get('budget')) : null,
      status: (formData.get('status') as string) || 'development',
    })
    .eq('id', id)

  if (error) redirect(`/projects/${id}/edit?error=` + encodeURIComponent(error.message))
  await triggerMatchScores('project', id)
  redirect(`/projects/${id}`)
}

export async function deleteProject(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('film_projects').delete().eq('id', formData.get('id') as string)
  redirect('/projects')
}

export async function trackFunding(formData: FormData) {
  const supabase = await createClient()
  const projectId = formData.get('project_id') as string

  await supabase.from('project_funding').insert({
    project_id: projectId,
    opportunity_id: formData.get('opportunity_id') as string,
    status: (formData.get('status') as string) || 'interested',
  })

  revalidatePath(`/projects/${projectId}`)
}

export async function updateTrackingStatus(formData: FormData) {
  const supabase = await createClient()

  await supabase
    .from('project_funding')
    .update({ status: formData.get('status') as string })
    .eq('id', formData.get('id') as string)

  revalidatePath(`/projects/${formData.get('project_id')}`)
}

export async function removeTracking(formData: FormData) {
  const supabase = await createClient()
  const projectId = formData.get('project_id') as string

  await supabase.from('project_funding').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/projects/${projectId}`)
}
