'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

interface NectarEntry {
  id: string
  latitude: number
  longitude: number
  plant_name: string
  bloom_start: string | null
  bloom_end: string | null
  nectar_quality: string | null
  notes: string | null
  users: { full_name: string }
}

const QUALITY_COLORS: Record<string, string> = {
  excellent: 'bg-green-500',
  good: 'bg-amber-500',
  average: 'bg-orange-400',
  poor: 'bg-red-400',
}

const QUALITY_LABELS: Record<string, string> = {
  excellent: 'Mükemmel',
  good: 'İyi',
  average: 'Orta',
  poor: 'Zayıf',
}

export default function NectarMapClient() {
  const [entries, setEntries] = useState<NectarEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [form, setForm] = useState({
    plant_name: '',
    bloom_start: '',
    bloom_end: '',
    nectar_quality: 'good',
    notes: '',
    latitude: '',
    longitude: '',
  })

  const loadEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/nectar-map')
      const data = await res.json()
      setEntries(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEntries()
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setForm(f => ({ ...f, latitude: String(pos.coords.latitude), longitude: String(pos.coords.longitude) }))
        },
        () => {}
      )
    }
  }, [loadEntries])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/nectar-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Nektar noktası eklendi')
      setShowForm(false)
      setForm(f => ({ ...f, plant_name: '', bloom_start: '', bloom_end: '', notes: '', nectar_quality: 'good' }))
      loadEntries()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eklenemedi')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 bg-muted rounded" />
          <div className="h-96 bg-muted rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nektar Haritası</h1>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-3 h-8 text-sm font-medium"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'İptal' : 'Nokta Ekle'}
        </button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Yeni Nektar Noktası</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Enlem *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Boylam *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Bitki Adı *</Label>
                <Input
                  value={form.plant_name}
                  onChange={e => setForm(f => ({ ...f, plant_name: e.target.value }))}
                  placeholder="ör. Ihlamur, Kestane, Çiçek"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Çiçeklenme Başlangıcı</Label>
                  <Input type="date" value={form.bloom_start} onChange={e => setForm(f => ({ ...f, bloom_start: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Çiçeklenme Sonu</Label>
                  <Input type="date" value={form.bloom_end} onChange={e => setForm(f => ({ ...f, bloom_end: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Nektar Kalitesi</Label>
                <select
                  value={form.nectar_quality}
                  onChange={e => setForm(f => ({ ...f, nectar_quality: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring h-9"
                >
                  {Object.entries(QUALITY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Notlar</Label>
                <Input
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Ek bilgi..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg px-4 h-8 text-sm font-medium"
                >
                  {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Harita placeholder (Mapbox token gerektirir) */}
      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 h-64 flex items-center justify-center border-b">
          <div className="text-center space-y-2">
            <MapPin className="h-10 w-10 text-green-500 mx-auto" />
            <p className="text-sm text-muted-foreground">
              Harita görünümü için Mapbox token gereklidir.
            </p>
            <p className="text-xs text-muted-foreground">
              NEXT_PUBLIC_MAPBOX_TOKEN env değişkenini ayarlayın.
            </p>
          </div>
          {entries.map(entry => (
            <div
              key={entry.id}
              className="absolute"
              style={{
                left: `${((entry.longitude - 25) / (45 - 25)) * 100}%`,
                top: `${((entry.latitude - 36) / (42 - 36)) * 100}%`,
              }}
              title={entry.plant_name}
            >
              <div className={`w-3 h-3 rounded-full ${QUALITY_COLORS[entry.nectar_quality || 'good'] || 'bg-amber-500'}`} />
            </div>
          ))}
        </div>
      </Card>

      {/* Liste */}
      <div className="space-y-2">
        <h2 className="font-semibold text-sm">Nektar Noktaları ({entries.length})</h2>
        {entries.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Henüz nektar noktası yok. İlk noktayı ekleyin!</p>
            </CardContent>
          </Card>
        ) : (
          entries.map(entry => (
            <Card key={entry.id}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`mt-1 w-3 h-3 rounded-full shrink-0 ${QUALITY_COLORS[entry.nectar_quality || 'good'] || 'bg-amber-500'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{entry.plant_name}</p>
                    {entry.nectar_quality && (
                      <Badge variant="outline" className="text-xs">
                        {QUALITY_LABELS[entry.nectar_quality] || entry.nectar_quality}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {entry.latitude.toFixed(4)}, {entry.longitude.toFixed(4)}
                  </div>
                  {entry.bloom_start && (
                    <p className="text-xs text-muted-foreground">
                      {entry.bloom_start} — {entry.bloom_end || '?'}
                    </p>
                  )}
                  {entry.notes && <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>}
                  <p className="text-xs text-muted-foreground mt-1">— {entry.users?.full_name}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
