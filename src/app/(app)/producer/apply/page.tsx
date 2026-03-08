'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface ProducerProfile {
  id: string
  farm_name: string
  location: string
  description: string
  is_verified: boolean
}

export default function ProducerApplyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [existing, setExisting] = useState<ProducerProfile | null | undefined>(undefined)
  const [form, setForm] = useState({
    farm_name: '',
    location: '',
    description: '',
    contact_phone: '',
    website_url: '',
    honey_types: '',
  })

  useEffect(() => {
    fetch('/api/producer/apply')
      .then(r => r.json())
      .then(data => setExisting(data || null))
      .catch(() => setExisting(null))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/producer/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          honey_types: form.honey_types.split(',').map(s => s.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Başvurunuz alındı')
      router.push('/app')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Başvuru gönderilemedi')
    } finally {
      setLoading(false)
    }
  }

  if (existing === undefined) {
    return <div className="container max-w-xl mx-auto p-4"><div className="animate-pulse h-40 bg-muted rounded-xl" /></div>
  }

  if (existing) {
    return (
      <div className="container max-w-xl mx-auto p-4 space-y-4">
        <Link href="/app" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Geri
        </Link>
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            {existing.is_verified ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <p className="font-semibold text-lg">Üretici Profiliniz Onaylandı</p>
                <Badge className="bg-green-500 text-white">Doğrulandı</Badge>
                <p className="text-sm text-muted-foreground">{existing.farm_name}</p>
              </>
            ) : (
              <>
                <Clock className="h-12 w-12 text-amber-500 mx-auto" />
                <p className="font-semibold text-lg">Başvurunuz İnceleniyor</p>
                <Badge variant="secondary">Beklemede</Badge>
                <p className="text-sm text-muted-foreground">
                  {existing.farm_name} başvurusu yöneticilerimiz tarafından incelenmektedir.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-xl mx-auto p-4 space-y-4">
      <Link href="/app" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Geri
      </Link>

      <div>
        <h1 className="text-xl font-bold">Üretici Başvurusu</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Balınızı ve ürünlerinizi ARIBox Pazar Yeri&apos;nde satmaya başlayın.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Çiftlik Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Çiftlik / İşletme Adı *</Label>
              <Input
                value={form.farm_name}
                onChange={e => setForm(f => ({ ...f, farm_name: e.target.value }))}
                placeholder="ör. Karadeniz Bal Çiftliği"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Konum (İl/İlçe) *</Label>
              <Input
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="ör. Trabzon, Maçka"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>İşletme Tanıtımı *</Label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Çiftliğinizi, üretim yönteminizi ve ürünlerinizi tanıtın..."
                rows={4}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label>Bal Çeşitleri</Label>
              <Input
                value={form.honey_types}
                onChange={e => setForm(f => ({ ...f, honey_types: e.target.value }))}
                placeholder="ör. çiçek balı, kestane balı, ıhlamur balı (virgülle ayırın)"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  type="tel"
                  value={form.contact_phone}
                  onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
              <div className="space-y-2">
                <Label>Web Sitesi</Label>
                <Input
                  type="url"
                  value={form.website_url}
                  onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))}
                  placeholder="https://"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg px-6 h-9 text-sm font-medium transition-colors"
              >
                {loading ? 'Gönderiliyor...' : 'Başvuru Yap'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
