import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { inspectionSchema } from '@/lib/validations/hive'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data, error } = await supabase
    .from('hive_inspections')
    .select('*')
    .eq('hive_id', id)
    .eq('user_id', user.id)
    .order('inspection_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  // Kovan sahibini doğrula
  const { data: hive } = await supabase
    .from('hives')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!hive) return NextResponse.json({ error: 'Kovan bulunamadı' }, { status: 404 })

  const body = await request.json()
  const result = inspectionSchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 })

  // Hava durumu bilgisi (opsiyonel — ilerleyen aşamada OpenWeatherMap entegrasyonu)
  const weatherTemp = null
  const weatherCondition = null

  const { data, error } = await supabase
    .from('hive_inspections')
    .insert({
      hive_id: id,
      user_id: user.id,
      ...result.data,
      weather_temp: weatherTemp,
      weather_condition: weatherCondition,
      photos: [],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
