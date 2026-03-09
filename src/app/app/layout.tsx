export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ADMIN_EMAIL, DEFAULT_USER_ROLE } from '@/lib/constants'
import AppHeader from '@/components/layout/AppHeader'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('id, role, email')
      .eq('id', user.id)
      .single()

    const desiredRole = user.email === ADMIN_EMAIL ? 'admin' : DEFAULT_USER_ROLE
    const admin = createAdminClient()

    if (!profile) {
      await admin.from('users').upsert(
        {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name ?? null,
          avatar_url: user.user_metadata?.avatar_url ?? null,
          role: desiredRole,
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )
    } else if (!profile.role || (profile.email === ADMIN_EMAIL && profile.role !== 'admin') || (profile.email !== ADMIN_EMAIL && profile.role === 'admin')) {
      await admin.from('users').update({ role: desiredRole }).eq('id', user.id)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
