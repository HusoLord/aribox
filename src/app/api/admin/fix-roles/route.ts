import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ADMIN_EMAIL, DEFAULT_USER_ROLE } from '@/lib/constants'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const admin = createAdminClient()

  const { error: makeAdminError } = await admin
    .from('users')
    .update({ role: 'admin' })
    .eq('email', ADMIN_EMAIL)

  const { error: makePremiumError } = await admin
    .from('users')
    .update({ role: DEFAULT_USER_ROLE })
    .neq('email', ADMIN_EMAIL)

  if (makeAdminError || makePremiumError) {
    return NextResponse.json(
      { error: 'Failed to update roles', makeAdminError, makePremiumError },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}

