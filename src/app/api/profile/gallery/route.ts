import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'Dosya gereklidir' }, { status: 400 })
  if (file.size > 10485760) {
    return NextResponse.json({ error: 'Dosya 10MB\'dan büyük olamaz' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const bucket = 'forum-media'
  const path = `${user.id}/profile-gallery/${Date.now()}.${ext}`
  const buffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}

