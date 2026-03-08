import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export const metadata = { title: 'Admin — Üreticiler' }

async function approveProducer(formData: FormData) {
  'use server'
  const producerId = formData.get('producer_id') as string
  const userId = formData.get('user_id') as string
  if (!producerId || !userId) return
  const supabase = createAdminClient()
  await supabase.from('producer_profiles').update({ is_verified: true }).eq('id', producerId)
  await supabase.from('users').update({ role: 'producer' }).eq('id', userId)
  revalidatePath('/admin/producers')
}

export default async function AdminProducersPage() {
  const supabase = await createClient()

  const { data: producers } = await supabase
    .from('producer_profiles')
    .select(`
      id, farm_name, location, is_verified, created_at,
      users(id, full_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Üretici Başvuruları</h1>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Çiftlik</th>
                <th className="text-left p-3 font-medium">Kullanıcı</th>
                <th className="text-left p-3 font-medium">Konum</th>
                <th className="text-left p-3 font-medium">Durum</th>
                <th className="text-left p-3 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {(producers || []).map(p => {
                const user = p.users as unknown as { id: string; full_name: string } | null
                return (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{p.farm_name}</td>
                    <td className="p-3 text-muted-foreground">{user?.full_name}</td>
                    <td className="p-3 text-muted-foreground">{p.location}</td>
                    <td className="p-3">
                      {p.is_verified ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" /> Onaylı
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <Clock className="h-3 w-3" /> Bekliyor
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {!p.is_verified && user && (
                        <form action={approveProducer}>
                          <input type="hidden" name="producer_id" value={p.id} />
                          <input type="hidden" name="user_id" value={user.id} />
                          <button
                            type="submit"
                            className="text-xs bg-green-500 hover:bg-green-600 text-white rounded px-3 py-1"
                          >
                            Onayla
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
