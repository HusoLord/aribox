import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Home, Plus, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { HIVE_TYPES, COLONY_STRENGTHS } from '@/lib/constants'

export const metadata = { title: 'Kovan Defteri' }

export default async function HivesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isPremium = profile?.role !== 'free'

  const { data: hives } = await supabase
    .from('hives')
    .select(`
      *,
      hive_inspections(id, inspection_date)
    `)
    .eq('user_id', user.id)
    .order('hive_number', { ascending: true })

  const strengthColors = {
    weak: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    strong: 'bg-green-100 text-green-700',
  }

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kovan Defteri</h1>
          <p className="text-sm text-muted-foreground">
            {hives?.length || 0} kovan
          </p>
        </div>
        {isPremium && (
          <Link
            href="/app/hives/new"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 h-9 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Kovan Ekle
          </Link>
        )}
      </div>

      {!isPremium && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-sm text-amber-800">Kovan defteri premium özelliktir.</p>
            <Link href="/app/subscription" className="text-sm font-medium text-amber-600 hover:underline">
              Premium ol
            </Link>
          </CardContent>
        </Card>
      )}

      {hives && hives.length > 0 ? (
        <div className="space-y-3">
          {hives.map(hive => {
            const lastInspection = hive.hive_inspections?.[0]
            return (
              <Link key={hive.id} href={`/app/hives/${hive.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-amber-100 rounded-xl shrink-0">
                      <Home className="h-5 w-5 text-amber-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{hive.name}</span>
                        <span className="text-xs text-muted-foreground">#{hive.hive_number}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {HIVE_TYPES[hive.hive_type as keyof typeof HIVE_TYPES]}
                        </span>
                        {hive.location_name && (
                          <span className="text-xs text-muted-foreground">• {hive.location_name}</span>
                        )}
                        {lastInspection && (
                          <span className="text-xs text-muted-foreground">
                            • Son kontrol: {formatDate(lastInspection.inspection_date)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {hive.colony_strength && (
                        <Badge className={`text-xs ${strengthColors[hive.colony_strength as keyof typeof strengthColors]}`}>
                          {COLONY_STRENGTHS[hive.colony_strength as keyof typeof COLONY_STRENGTHS]}
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : isPremium ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <Home className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">Henüz kovan eklemediniz</p>
            <p className="text-sm text-muted-foreground">İlk kovanınızı ekleyerek başlayın</p>
            <Link
              href="/app/hives/new"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 h-9 text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Kovan Ekle
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
