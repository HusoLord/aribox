'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function SellPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [hasProducerProfile, setHasProducerProfile] = useState<boolean | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    unit: 'kg',
    stock_quantity: '',
    category: 'bal',
    is_organic: false,
  })

  useEffect(() => {
    fetch('/api/producer/apply')
      .then(r => r.json())
      .then(data => setHasProducerProfile(data?.is_verified === true))
      .catch(() => setHasProducerProfile(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.category) {
      toast.error('Zorunlu alanları doldurun')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          stock_quantity: parseInt(form.stock_quantity) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Ürün eklendi')
      router.push('/app/marketplace')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ürün eklenemedi')
    } finally {
      setLoading(false)
    }
  }

  if (hasProducerProfile === null) {
    return <div className="container max-w-xl mx-auto p-4"><div className="animate-pulse h-40 bg-muted rounded-xl" /></div>
  }

  if (!hasProducerProfile) {
    return (
      <div className="container max-w-xl mx-auto p-4 space-y-4">
        <Link href="/app/marketplace" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Geri
        </Link>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 text-center space-y-3">
            <p className="font-medium">Ürün satmak için doğrulanmış üretici profiliniz gereklidir.</p>
            <Link
              href="/app/producer/apply"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-6 py-2 text-sm font-medium"
            >
              Üretici Başvurusu Yap
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const categories = ['bal', 'balmumu', 'propolis', 'arı_sütü', 'petek', 'ekipman', 'diğer']
  const units = ['kg', 'gr', 'lt', 'ml', 'adet', 'paket']

  return (
    <div className="container max-w-xl mx-auto p-4 space-y-4">
      <Link href="/app/marketplace" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Pazar Yerine Dön
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Yeni Ürün Ekle</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Ürün Adı *</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ör. Çiçek Balı"
              />
            </div>

            <div className="space-y-2">
              <Label>Açıklama</Label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Ürününüzü tanıtın..."
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2 col-span-2">
                <Label>Fiyat (TL) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Birim</Label>
                <select
                  value={form.unit}
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring h-10"
                >
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kategori *</Label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring h-10"
                >
                  {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Stok Miktarı</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.stock_quantity}
                  onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="organic"
                checked={form.is_organic}
                onChange={e => setForm(f => ({ ...f, is_organic: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="organic" className="text-sm">Organik ürün</label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg px-6 h-9 text-sm font-medium transition-colors"
              >
                {loading ? 'Ekleniyor...' : 'Ürün Ekle'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
