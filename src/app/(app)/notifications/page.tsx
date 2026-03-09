export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Bell } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export const metadata = { title: 'Bildirimler' }

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Bildirimler</h1>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map(n => (
            <Card key={n.id} className={n.is_read ? 'opacity-60' : 'border-amber-200'}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`p-2 rounded-lg mt-0.5 ${n.is_read ? 'bg-muted' : 'bg-amber-100'}`}>
                  <Bell className={`h-4 w-4 ${n.is_read ? 'text-muted-foreground' : 'text-amber-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(n.created_at)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
            <Bell className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">Henüz bildiriminiz yok</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
