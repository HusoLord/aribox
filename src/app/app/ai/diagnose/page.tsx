export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import DiagnoseClient from './DiagnoseClient'

export const metadata = { title: 'Görsel Hastalık Teşhisi' }

export default async function DiagnosePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isPremium = profile?.role !== 'free'

  if (!isPremium) {
    return (
      <div className="container max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">Görsel Hastalık Teşhisi</h1>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-8 text-center space-y-3">
            <Lock className="h-12 w-12 text-amber-500 mx-auto" />
            <p className="font-medium">Hastalık teşhisi premium özelliğidir.</p>
            <a
              href="/app/subscription"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-6 py-2 text-sm font-medium"
            >
              Premium ol
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <DiagnoseClient />
}
