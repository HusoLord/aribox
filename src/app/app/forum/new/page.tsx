'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  slug: string
}

export default function NewTopicPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    category_id: '',
    title: '',
    content: '',
    tags: '',
  })

  useEffect(() => {
    fetch('/api/forum/categories').then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.category_id || !form.title || !form.content) return

    setLoading(true)
    try {
      const res = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: form.category_id,
          title: form.title,
          content: form.content,
          tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        }),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || 'Konu açılamadı')
        return
      }

      toast.success('Konu açıldı')
      router.push(`/app/forum/topic/${result.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Yeni Konu Aç</h1>

      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader><CardTitle className="text-base">Konu Bilgileri</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Select onValueChange={(v) => setForm(f => ({ ...f, category_id: (v as string) || f.category_id }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Başlık *</Label>
              <Input
                placeholder="Konunuzun başlığı..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>İçerik *</Label>
              <Textarea
                placeholder="Sorunuzu veya paylaşımınızı yazın..."
                rows={8}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Etiketler</Label>
              <Input
                placeholder="varroa, tedavi, kışlama (virgülle ayırın)"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                İptal
              </Button>
              <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600" disabled={loading}>
                {loading ? 'Yayınlanıyor...' : 'Konuyu Yayınla'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
