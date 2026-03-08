'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inspectionSchema, type InspectionInput } from '@/lib/validations/hive'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function InspectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InspectionInput>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      inspection_date: new Date().toISOString().slice(0, 16),
      queen_seen: false,
      disease_signs: false,
      actions_taken: [],
    },
  })

  const queenSeen = watch('queen_seen')
  const diseaseSigns = watch('disease_signs')

  async function onSubmit(data: InspectionInput) {
    setLoading(true)
    try {
      const res = await fetch(`/api/hives/${id}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || 'Kontrol kaydedilemedi')
        return
      }

      toast.success('Kontrol kaydedildi')
      router.push(`/app/hives/${id}`)
    } finally {
      setLoading(false)
    }
  }

  const actions = [
    'Besleme yapıldı',
    'İlaçlama yapıldı',
    'Çerçeve eklendi',
    'Bölme yapıldı',
    'Ana arı değiştirildi',
    'Oğul alındı',
    'Hasat yapıldı',
  ]

  const [selectedActions, setSelectedActions] = useState<string[]>([])

  function toggleAction(action: string) {
    const updated = selectedActions.includes(action)
      ? selectedActions.filter(a => a !== action)
      : [...selectedActions, action]
    setSelectedActions(updated)
    setValue('actions_taken', updated)
  }

  return (
    <div className="container max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Kontrol Kaydı Ekle</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Genel Bilgiler</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inspection_date">Kontrol Tarihi ve Saati *</Label>
              <Input id="inspection_date" type="datetime-local" {...register('inspection_date')} />
              {errors.inspection_date && <p className="text-xs text-red-500">{errors.inspection_date.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Kovan Durumu</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Ana arı görüldü mü?</Label>
              <button
                type="button"
                onClick={() => setValue('queen_seen', !queenSeen)}
                className={`w-12 h-6 rounded-full transition-colors ${queenSeen ? 'bg-green-500' : 'bg-muted'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${queenSeen ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <Label>Hastalık belirtisi var mı?</Label>
              <button
                type="button"
                onClick={() => setValue('disease_signs', !diseaseSigns)}
                className={`w-12 h-6 rounded-full transition-colors ${diseaseSigns ? 'bg-red-500' : 'bg-muted'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${diseaseSigns ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {diseaseSigns && (
              <div className="space-y-2">
                <Label htmlFor="disease_notes">Hastalık Notları</Label>
                <Textarea id="disease_notes" placeholder="Hastalık belirtilerini açıklayın..." {...register('disease_notes')} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Yapılan İşlemler</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {actions.map(action => (
                <button
                  key={action}
                  type="button"
                  onClick={() => toggleAction(action)}
                  className={`text-left text-xs p-2.5 rounded-lg border transition-colors ${
                    selectedActions.includes(action)
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {action}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Notlar</CardTitle></CardHeader>
          <CardContent>
            <Textarea placeholder="Bu kontrol hakkında notlarınız..." {...register('notes')} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
            İptal
          </Button>
          <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </div>
  )
}
