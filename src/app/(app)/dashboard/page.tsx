'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { TrendingUp, Package2, MessageSquare, Beaker } from 'lucide-react'

interface DashboardData {
  hive_count: number
  inspection_count: number
  ai_questions_today: number
  ai_questions_total: number
  inspections_by_month: Array<{ month: string; count: number }>
  colony_strength: Array<{ strength: string; count: number }>
  recent_diagnoses: Array<{ condition: string; created_at: string }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <p className="text-muted-foreground">Dashboard verileri yüklenemedi.</p>
      </div>
    )
  }

  const stats = [
    { label: 'Kovan', value: data.hive_count, icon: Package2, color: 'text-amber-500' },
    { label: 'Kontrol', value: data.inspection_count, icon: Beaker, color: 'text-blue-500' },
    { label: 'AI (bugün)', value: data.ai_questions_today, icon: MessageSquare, color: 'text-green-500' },
    { label: 'AI (toplam)', value: data.ai_questions_total, icon: TrendingUp, color: 'text-purple-500' },
  ]

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Analitik</h1>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Aylık Kontroller */}
      {data.inspections_by_month.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Aylık Kovan Kontrolleri</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.inspections_by_month}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Kontrol" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Koloni güçleri */}
      {data.colony_strength.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Koloni Güçleri</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data.colony_strength} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis type="category" dataKey="strength" tick={{ fontSize: 11 }} width={70} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} name="Kovan" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Son Teşhisler */}
      {data.recent_diagnoses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Son Hastalık Teşhisleri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recent_diagnoses.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span>{d.condition}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(d.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
