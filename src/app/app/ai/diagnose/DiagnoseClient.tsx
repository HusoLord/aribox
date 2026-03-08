'use client'

import { useState, useRef } from 'react'
import { Upload, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface DiagnosisResult {
  condition: string
  confidence: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  symptoms: string[]
  treatment: string[]
  prevention: string[]
  veterinary_required: boolean
  disclaimer: string
}

const severityConfig = {
  low: { label: 'Düşük Risk', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  medium: { label: 'Orta Risk', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
  high: { label: 'Yüksek Risk', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
  critical: { label: 'Kritik', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
}

export default function DiagnosePage() {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setFile(f)
    setResult(null)
    setError(null)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  async function analyze() {
    if (!file) return
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('photo', file)

    try {
      const res = await fetch('/api/ai/diagnose', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Analiz sırasında hata oluştu')
        return
      }

      setResult(data.diagnosis)
    } catch {
      setError('Bağlantı hatası oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Görsel Hastalık Teşhisi</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Arı, petek veya kovan fotoğrafı yükleyin, AI analiz etsin.
        </p>
      </div>

      {/* Yükleme alanı */}
      <div
        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {preview ? (
          <div className="relative w-full aspect-video max-h-48 overflow-hidden rounded-lg">
            <Image src={preview} alt="Yüklenen fotoğraf" fill className="object-contain" />
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">Fotoğraf yüklemek için tıklayın</p>
            <p className="text-sm text-muted-foreground mt-1">veya sürükleyip bırakın</p>
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WebP • Maks. 10MB</p>
          </>
        )}
      </div>

      {file && !loading && (
        <Button
          onClick={analyze}
          className="w-full bg-amber-500 hover:bg-amber-600"
        >
          Analiz Et
        </Button>
      )}

      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-sm text-muted-foreground">Fotoğraf analiz ediliyor...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-4">
          {/* Sonuç başlığı */}
          <Card className={`border-2 ${
            result.severity === 'critical' ? 'border-red-300' :
            result.severity === 'high' ? 'border-orange-300' :
            result.severity === 'medium' ? 'border-yellow-300' : 'border-green-300'
          }`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{result.condition}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={severityConfig[result.severity].color}>
                    {severityConfig[result.severity].label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    %{result.confidence} güven
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {result.symptoms.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Gözlemlenen Belirtiler</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {result.symptoms.map((s, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {result.treatment.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Önerilen Tedavi</CardTitle></CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {result.treatment.map((t, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="font-medium text-amber-600 shrink-0">{i + 1}.</span> {t}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {result.veterinary_required && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">
                  Bu durum için veteriner hekim görüşü gerekmektedir.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{result.disclaimer}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
