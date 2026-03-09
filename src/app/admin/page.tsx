export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, MessageSquare, ShoppingBag } from 'lucide-react'

export const metadata = { title: 'Admin — Genel Bakış' }

export default async function AdminPage() {
  const supabase = await createClient()

  const [users, producers, topics, orders] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('producer_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('forum_topics').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
  ])

  const premiumCount = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .in('role', ['premium', 'producer'])

  const stats = [
    { label: 'Toplam Kullanıcı', value: users.count || 0, icon: Users, color: 'text-blue-500' },
    { label: 'Premium Üye', value: premiumCount.count || 0, icon: Users, color: 'text-amber-500' },
    { label: 'Üretici', value: producers.count || 0, icon: Package, color: 'text-green-500' },
    { label: 'Forum Konusu', value: topics.count || 0, icon: MessageSquare, color: 'text-purple-500' },
    { label: 'Sipariş', value: orders.count || 0, icon: ShoppingBag, color: 'text-orange-500' },
  ]

  const { data: recentUsers } = await supabase
    .from('users')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Genel Bakış</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <stat.icon className={`h-6 w-6 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Son Katılan Kullanıcılar</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-muted-foreground">Ad</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Rol</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Kayıt</th>
              </tr>
            </thead>
            <tbody>
              {(recentUsers || []).map(u => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-2">{u.full_name || '—'}</td>
                  <td className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.role === 'admin' ? 'bg-red-100 text-red-700' :
                      u.role === 'premium' ? 'bg-amber-100 text-amber-700' :
                      u.role === 'producer' ? 'bg-green-100 text-green-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
