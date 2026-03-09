export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Home, Plus, Check, X, Calendar } from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { HIVE_TYPES, COLONY_STRENGTHS } from '@/lib/constants'

export default async function HiveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: hive } = await supabase
    .from('hives')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!hive) notFound()

  const { data: inspections } = await supabase
    .from('hive_inspections')
    .select('*')
    .eq('hive_id', id)
    .order('inspection_date', { ascending: false })
    .limit(20)

  const lastInspection = inspections?.[0]

  const strengthColors = {
    weak: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    strong: 'bg-green-100 text-green-700',
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      {/* Başlık */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Home className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{hive.name}</h1>
            <p className="text-sm text-muted-foreground">Kovan #{hive.hive_number}</p>
          </div>
        </div>
        <Link
          href={`/app/hives/${id}/inspect`}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 h-9 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Kontrol Ekle
        </Link>
      </div>

      {/* Kovan bilgileri */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Kovan Bilgileri</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Tip</span>
            <p className="font-medium">{HIVE_TYPES[hive.hive_type as keyof typeof HIVE_TYPES]}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Koloni Gücü</span>
            <p>
              {hive.colony_strength ? (
                <Badge className={`text-xs ${strengthColors[hive.colony_strength as keyof typeof strengthColors]}`}>
                  {COLONY_STRENGTHS[hive.colony_strength as keyof typeof COLONY_STRENGTHS]}
                </Badge>
              ) : '—'}
            </p>
          </div>
          {hive.location_name && (
            <div>
              <span className="text-muted-foreground">Konum</span>
              <p className="font-medium">{hive.location_name}</p>
            </div>
          )}
          {hive.queen_breed && (
            <div>
              <span className="text-muted-foreground">Ana Arı Irkı</span>
              <p className="font-medium">{hive.queen_breed}</p>
            </div>
          )}
          {hive.queen_marking_color && (
            <div>
              <span className="text-muted-foreground">Ana Arı Rengi</span>
              <p className="font-medium">{hive.queen_marking_color}</p>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Eklenme</span>
            <p className="font-medium">{formatDate(hive.created_at)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Son kontrol özeti */}
      {lastInspection && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Son Kontrol</CardTitle>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(lastInspection.inspection_date)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              {lastInspection.queen_seen ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span className="text-muted-foreground">Ana arı görüldü</span>
            </div>
            <div className="flex items-center gap-2">
              {lastInspection.disease_signs ? (
                <X className="h-4 w-4 text-red-500" />
              ) : (
                <Check className="h-4 w-4 text-green-500" />
              )}
              <span className="text-muted-foreground">Hastalık belirtisi</span>
            </div>
            {lastInspection.weather_temp && (
              <div>
                <span className="text-muted-foreground">Hava</span>
                <p className="font-medium">{lastInspection.weather_temp}°C</p>
              </div>
            )}
            {lastInspection.notes && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Not</span>
                <p className="font-medium">{lastInspection.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Kontrol geçmişi */}
      <div>
        <h2 className="font-semibold mb-3">Kontrol Geçmişi ({inspections?.length || 0})</h2>
        {inspections && inspections.length > 0 ? (
          <div className="space-y-2">
            {inspections.map(inspection => (
              <Card key={inspection.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{formatDate(inspection.inspection_date)}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {inspection.queen_seen && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Ana arı
                        </span>
                      )}
                      {inspection.disease_signs && (
                        <span className="text-xs text-red-600 flex items-center gap-1">
                          <X className="h-3 w-3" /> Hastalık
                        </span>
                      )}
                      {inspection.notes && (
                        <span className="text-xs text-muted-foreground truncate">{inspection.notes}</span>
                      )}
                    </div>
                  </div>
                  {inspection.weather_temp && (
                    <span className="text-sm text-muted-foreground shrink-0">{inspection.weather_temp}°C</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Henüz kontrol kaydı yok</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
