'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { hiveSchema, type HiveInput } from '@/lib/validations/hive'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function NewHivePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<HiveInput>({
    resolver: zodResolver(hiveSchema),
    defaultValues: { hive_type: 'langstroth' },
  })

  async function onSubmit(data: HiveInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/hives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || 'Kovan eklenemedi')
        return
      }

      toast.success('Kovan eklendi')
      router.push(`/app/hives/${result.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Yeni Kovan Ekle</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kovan Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Kovan Adı *</Label>
                <Input id="name" placeholder="Örn: Kovan A" {...register('name')} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hive_number">Kovan No *</Label>
                <Input id="hive_number" type="number" placeholder="1" {...register('hive_number')} />
                {errors.hive_number && <p className="text-xs text-red-500">{errors.hive_number.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kovan Tipi</Label>
              <Select onValueChange={(v) => setValue('hive_type', v as HiveInput['hive_type'])} defaultValue="langstroth">
                <SelectTrigger>
                  <SelectValue placeholder="Kovan tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="langstroth">Langstroth</SelectItem>
                  <SelectItem value="dadant">Dadant</SelectItem>
                  <SelectItem value="local">Yerli Kovan</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Koloni Gücü</Label>
              <Select onValueChange={(v) => setValue('colony_strength', v as HiveInput['colony_strength'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Koloni gücü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weak">Zayıf</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="strong">Güçlü</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_name">Konum Adı</Label>
              <Input id="location_name" placeholder="Örn: Ön Bahçe, Dağ Arılığı" {...register('location_name')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="queen_breed">Ana Arı Irkı</Label>
                <Input id="queen_breed" placeholder="Örn: Kafkas, Karniyol" {...register('queen_breed')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="queen_marking_color">Ana Arı Rengi</Label>
                <Input id="queen_marking_color" placeholder="Örn: Sarı (2026)" {...register('queen_marking_color')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea id="notes" placeholder="Kovan hakkında notlarınız..." {...register('notes')} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600"
                disabled={loading}
              >
                {loading ? 'Ekleniyor...' : 'Kovan Ekle'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
