import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const with_user = searchParams.get('with')

  if (with_user) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${with_user}),and(sender_id.eq.${with_user},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    await supabase.from('messages')
      .update({ is_read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', with_user)

    return NextResponse.json(data || [])
  }

  // Son konusmalar
  const { data: sent } = await supabase
    .from('messages')
    .select('receiver_id, users!messages_receiver_id_fkey(id, full_name, avatar_url)')
    .eq('sender_id', user.id)

  const { data: received } = await supabase
    .from('messages')
    .select('sender_id, users!messages_sender_id_fkey(id, full_name, avatar_url)')
    .eq('receiver_id', user.id)

  const contactIds = new Set<string>()
  const contacts: Array<{ id: string; full_name: string; avatar_url: string | null }> = []

  for (const m of (sent || [])) {
    if (!contactIds.has(m.receiver_id)) {
      contactIds.add(m.receiver_id)
      const u = m.users as unknown as { id: string; full_name: string; avatar_url: string | null }
      if (u) contacts.push(u)
    }
  }
  for (const m of (received || [])) {
    if (!contactIds.has(m.sender_id)) {
      contactIds.add(m.sender_id)
      const u = m.users as unknown as { id: string; full_name: string; avatar_url: string | null }
      if (u) contacts.push(u)
    }
  }

  return NextResponse.json(contacts)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { receiver_id, content } = await request.json()
  if (!receiver_id || !content?.trim()) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: user.id, receiver_id, content: content.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
