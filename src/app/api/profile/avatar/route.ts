import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  const type = (formData.get('type') as string) || 'avatar' // 'avatar' | 'cover'

  if (!file) return NextResponse.json({ error: 'Dosya gereklidir' }, { status: 400 })
  if (file.size > 10485760) return NextResponse.json({ error: 'Dosya 10MB\'dan büyük olamaz' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const bucket = type === 'cover' ? 'covers' : 'avatars'
  const fileName = `${user.id}/${type}-${Date.now()}.${ext}`
  const buffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, buffer, { contentType: file.type, upsert: true })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)

  // users tablosunu güncelle
  const field = type === 'cover' ? 'cover_photo_url' : 'avatar_url'
  await supabase.from('users').update({ [field]: publicUrl, updated_at: new Date().toISOString() }).eq('id', user.id)

  return NextResponse.json({ url: publicUrl })
}
