import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [hives, inspections, aiToday, aiTotal, diagnoses] = await Promise.all([
    supabase.from('hives').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('hive_inspections')
      .select('id, inspection_date, hives!inner(user_id)')
      .eq('hives.user_id', user.id),
    supabase.from('ai_conversations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString()),
    supabase.from('ai_conversations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase.from('ai_disease_diagnoses')
      .select('condition, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Aylık kontrol sayıları (son 6 ay)
  const inspectionsByMonth: Record<string, number> = {}
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  for (const insp of (inspections.data || [])) {
    const date = new Date(insp.inspection_date)
    if (date >= sixMonthsAgo) {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      inspectionsByMonth[key] = (inspectionsByMonth[key] || 0) + 1
    }
  }

  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('tr-TR', { month: 'short' })
    months.push({ month: label, count: inspectionsByMonth[key] || 0 })
  }

  // Kovan güçleri
  const strengthMap: Record<string, number> = {}
  for (const h of (hives.data || [])) {
    const s = (h as { colony_strength?: string }).colony_strength || 'Belirtilmemiş'
    strengthMap[s] = (strengthMap[s] || 0) + 1
  }

  const strength_labels: Record<string, string> = {
    weak: 'Zayıf',
    medium: 'Orta',
    strong: 'Güçlü',
    very_strong: 'Çok Güçlü',
  }

  const { data: hivesWithStrength } = await supabase
    .from('hives')
    .select('colony_strength')
    .eq('user_id', user.id)

  const strengthCount: Record<string, number> = {}
  for (const h of (hivesWithStrength || [])) {
    const s = h.colony_strength || 'other'
    strengthCount[s] = (strengthCount[s] || 0) + 1
  }

  const colony_strength = Object.entries(strengthCount).map(([k, v]) => ({
    strength: strength_labels[k] || k,
    count: v,
  }))

  return NextResponse.json({
    hive_count: hives.count || 0,
    inspection_count: inspections.data?.length || 0,
    ai_questions_today: aiToday.count || 0,
    ai_questions_total: aiTotal.count || 0,
    inspections_by_month: months,
    colony_strength,
    recent_diagnoses: diagnoses.data || [],
  })
}
