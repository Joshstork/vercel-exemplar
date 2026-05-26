'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/lib/supabase/server'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single()
  if (!profile?.is_admin) redirect('/funding')
  return supabase
}

export async function createFundingOpportunity(formData: FormData) {
  const supabase = await verifyAdmin()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('funding_opportunities').insert({
    created_by: user!.id,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    amount: formData.get('amount') ? Number(formData.get('amount')) : null,
    deadline: (formData.get('deadline') as string) || null,
    source: (formData.get('source') as string) || null,
    type: (formData.get('type') as string) || 'grant',
  })

  if (error) redirect('/funding/new?error=' + encodeURIComponent(error.message))
  redirect('/funding')
}

export async function updateFundingOpportunity(formData: FormData) {
  const supabase = await verifyAdmin()
  const id = formData.get('id') as string

  const { error } = await supabase.from('funding_opportunities').update({
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    amount: formData.get('amount') ? Number(formData.get('amount')) : null,
    deadline: (formData.get('deadline') as string) || null,
    source: (formData.get('source') as string) || null,
    type: (formData.get('type') as string) || 'grant',
  }).eq('id', id)

  if (error) redirect(`/funding/${id}/edit?error=` + encodeURIComponent(error.message))
  redirect('/funding')
}

export async function deleteFundingOpportunity(formData: FormData) {
  const supabase = await verifyAdmin()
  await supabase.from('funding_opportunities').delete().eq('id', formData.get('id') as string)
  revalidatePath('/funding')
}
