'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/lib/supabase/server'
import { createAdminClient } from '@/app/lib/supabase/admin'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')
  return user
}

export async function setAdminStatus(formData: FormData) {
  const currentUser = await assertAdmin()

  const targetUserId = formData.get('user_id') as string
  if (targetUserId === currentUser.id) return // can't change own role

  const isAdmin = formData.get('is_admin') === 'true'
  const adminClient = createAdminClient()
  await adminClient.from('profiles').update({ is_admin: isAdmin }).eq('user_id', targetUserId)

  revalidatePath('/admin')
}
