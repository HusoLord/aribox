'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, Check, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import type { User } from '@/types/database.types'

const ROLE_LABELS: Record<string, string> = {
  free: 'Ücretsiz',
  premium: 'Premium',
  producer: 'Üretici',
  admin: 'Admin',
}

const ROLE_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  premium: 'bg-amber-100 text-amber-700',
  producer: 'bg-green-100 text-green-700',
  admin: 'bg-red-100 text-red-700',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null)
  const [hiveCount, setHiveCount] = useState(0)
  const [forumCount, setForumCount] = useState(0)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ full_name: '', bio: '', username: '', phone: '', city: '' })
  const avatarRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [gallery, setGallery] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const [{ data: p }, { count: hc }, { count: fc }] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('hives').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
        supabase.from('forum_topics').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ])
      setProfile(p)
      setHiveCount(hc || 0)
      setForumCount(fc || 0)
      if (p) setForm({ full_name: p.full_name || '', bio: p.bio || '', username: p.username || '', phone: p.phone || '', city: p.city || '' })

      // Profil galerisi: forum-media bucket'ında saklanan görselleri listele
      const { data: files } = await supabase.storage
        .from('forum-media')
        .list(`${user.id}/profile-gallery`, { limit: 20, sortBy: { column: 'created_at', order: 'desc' } })

      if (files && files.length > 0) {
        const urls = files.map(file => {
          const { data: { publicUrl } } = supabase.storage
            .from('forum-media')
            .getPublicUrl(`${user.id}/profile-gallery/${file.name}`)
          return publicUrl
        })
        setGallery(urls)
      }
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Kaydedilemedi'); return }
      setProfile(data)
      setEditing(false)
      toast.success('Profil güncellendi')
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(file: File, type: 'avatar' | 'cover') {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', type)
    const toastId = toast.loading('Yükleniyor...')
    const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd })
    const data = await res.json()
    toast.dismiss(toastId)
    if (!res.ok) { toast.error(data.error || 'Yükleme başarısız'); return }
    setProfile(prev => prev ? { ...prev, [type === 'cover' ? 'cover_photo_url' : 'avatar_url']: data.url } : prev)
    toast.success(type === 'cover' ? 'Kapak güncellendi' : 'Avatar güncellendi')
  }

  async function handleGalleryUpload(files: FileList) {
    const uploading = Array.from(files).slice(0, 6) // aynı anda en fazla 6
    const urls: string[] = []

    for (const file of uploading) {
      const fd = new FormData()
      fd.append('file', file)
      const toastId = toast.loading('Fotoğraf yükleniyor...')
      const res = await fetch('/api/profile/gallery', { method: 'POST', body: fd })
      const data = await res.json()
      toast.dismiss(toastId)
      if (res.ok && data.url) {
        urls.push(data.url)
      } else {
        toast.error(data.error || 'Fotoğraf yüklenemedi')
      }
    }

    if (urls.length > 0) {
      setGallery(prev => [...urls, ...prev].slice(0, 20))
      toast.success('Profil galerisi güncellendi')
    }
  }

  if (!profile) {
    return (
      <div className="animate-pulse space-y-4 p-4 max-w-2xl mx-auto">
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-20 w-20 bg-muted rounded-full -mt-12 ml-4" />
        <div className="h-6 w-48 bg-muted rounded mt-12" />
      </div>
    )
  }

  const initials = profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Kapak + Avatar */}
      <div className="relative">
        <div
          className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200 cursor-pointer group"
          onClick={() => coverRef.current?.click()}
        >
          {profile.cover_photo_url ? (
            <Image src={profile.cover_photo_url} alt="Kapak" fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-amber-400 text-sm">Kapak fotoğrafı eklemek için tıklayın</p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <input ref={coverRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')} />
        </div>

        <div className="absolute -bottom-10 left-4 cursor-pointer group" onClick={() => avatarRef.current?.click()}>
          <div className="relative h-20 w-20 rounded-full border-4 border-background overflow-hidden bg-amber-100">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.full_name || ''} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-amber-700 font-bold text-xl">{initials}</div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-full flex items-center justify-center">
              <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'avatar')} />
        </div>
      </div>

      {/* Profil Başlığı */}
      <div className="pt-10 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{profile.full_name || 'İsimsiz Kullanıcı'}</h1>
          {profile.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
          <div className="mt-1">
            <Badge className={ROLE_COLORS[profile.role]}>{ROLE_LABELS[profile.role]}</Badge>
          </div>
          {!editing && profile.bio && <p className="text-sm text-muted-foreground mt-2 max-w-sm">{profile.bio}</p>}
        </div>
        <button
          onClick={() => { setEditing(e => !e); if (editing) setForm({ full_name: profile.full_name || '', bio: profile.bio || '', username: profile.username || '', phone: profile.phone || '', city: profile.city || '' }) }}
          className="flex items-center gap-1.5 text-sm border rounded-lg px-3 h-8 hover:bg-muted transition-colors"
        >
          {editing ? <><X className="h-3.5 w-3.5" /> İptal</> : <><Pencil className="h-3.5 w-3.5" /> Düzenle</>}
        </button>
      </div>

      {/* Düzenleme Formu */}
      {editing && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Profili Düzenle</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Ad Soyad</Label>
              <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Kullanıcı Adı</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                <Input className="pl-7" value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                  placeholder="kullaniciadi" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Biyografi</Label>
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Kendinizi kısaca tanıtın..."
                maxLength={300}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">{form.bio.length}/300</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Telefon</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="05XX XXX XX XX" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Şehir</Label>
                <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="İstanbul" />
              </div>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg h-9 text-sm font-medium">
              <Check className="h-4 w-4" />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </CardContent>
        </Card>
      )}

      {/* İstatistikler */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{hiveCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Aktif Kovan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{forumCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Forum Konusu</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{new Date(profile.created_at).getFullYear()}</p>
            <p className="text-xs text-muted-foreground mt-1">Üyelik Yılı</p>
          </CardContent>
        </Card>
      </div>

      {/* Profil Galerisi */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Profil Galerisi</CardTitle>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="flex items-center gap-1.5 text-xs border rounded-lg px-3 h-8 hover:bg-muted transition-colors"
          >
            <Camera className="h-3.5 w-3.5" />
            Fotoğraf Ekle
          </button>
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => e.target.files && e.target.files.length > 0 && handleGalleryUpload(e.target.files)}
          />
        </CardHeader>
        <CardContent className="space-y-3">
          {gallery.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Henüz profil galeriniz boş. Buraya eklediğiniz fotoğraflar sadece ARIBox profil sayfanızda görünür ve şu an için
              <span className="font-semibold"> demo amaçlı</span> olarak saklanır.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Bu fotoğraflar profilinizi zenginleştirmek için eklenmiştir. Örnek ya da gerçek kovan/fotoğraf içerikleri
                paylaşabilirsiniz.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {gallery.map(url => (
                  <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <Image src={url} alt="Profil fotoğrafı" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Hesap Detayları */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Hesap Bilgileri</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">E-posta</span>
            <span>{profile.email}</span>
          </div>
          {profile.phone && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Telefon</span>
              <span>{profile.phone}</span>
            </div>
          )}
          {profile.city && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Şehir</span>
              <span>{profile.city}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Üyelik Tarihi</span>
            <span>{new Date(profile.created_at).toLocaleDateString('tr-TR')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
