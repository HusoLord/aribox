'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface Article {
  id: string
  title: string
  category: string
  is_premium: boolean
  created_at: string
}

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: 'haberler',
    is_premium: true,
    image_url: '',
    source_url: '',
    tags: '',
  })

  const load = () => {
    fetch('/api/news?limit=50')
      .then(r => r.json())
      .then(data => setArticles(data.articles || []))
      .catch(() => {})
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Haber eklendi')
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Haber eklenemedi')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Haberler</h1>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-3 h-8 text-sm"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'İptal' : 'Yeni Haber'}
        </button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Yeni Haber Ekle</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Başlık *</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Slug *</Label>
                  <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required placeholder="haber-basligi" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Özet</Label>
                <Input value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">İçerik *</Label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={5}
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Kategori</Label>
                  <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Görsel URL</Label>
                  <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Etiketler (virgülle)</Label>
                  <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_premium"
                  checked={form.is_premium}
                  onChange={e => setForm(f => ({ ...f, is_premium: e.target.checked }))}
                />
                <label htmlFor="is_premium" className="text-sm">Premium içerik</label>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg px-4 h-8 text-sm">
                  {submitting ? 'Ekleniyor...' : 'Ekle'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Başlık</th>
                <th className="text-left p-3 font-medium">Kategori</th>
                <th className="text-left p-3 font-medium">Tür</th>
                <th className="text-left p-3 font-medium">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="p-3 max-w-xs truncate">{a.title}</td>
                  <td className="p-3 text-muted-foreground">{a.category}</td>
                  <td className="p-3">
                    <Badge variant={a.is_premium ? 'default' : 'secondary'} className="text-xs">
                      {a.is_premium ? 'Premium' : 'Ücretsiz'}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{formatDate(a.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
