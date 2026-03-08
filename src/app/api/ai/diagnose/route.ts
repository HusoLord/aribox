import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DIAGNOSE_PROMPT = `Sen bir arıcılık ve arı sağlığı uzmanısın. Sana gönderilen fotoğrafı analiz et ve Türkçe olarak yanıt ver.

Aşağıdaki JSON formatında yanıt ver:
{
  "condition": "tespit edilen durum adı",
  "confidence": 85,
  "severity": "low|medium|high|critical",
  "description": "kısa açıklama",
  "symptoms": ["semptom 1", "semptom 2"],
  "treatment": ["tedavi adımı 1", "tedavi adımı 2"],
  "prevention": ["önleme yöntemi 1"],
  "veterinary_required": true/false,
  "disclaimer": "Bu bir ön değerlendirmedir. Kesin teşhis için veteriner hekime başvurun."
}

Tanıyabileceğin durumlar:
- Varroa destructor enfestasyonu
- Amerikan yavru çürüklüğü
- Avrupa yavru çürüklüğü
- Nosema enfeksiyonu
- Kireç hastalığı (chalkbrood)
- Taş hastalığı (stonebrood)
- Balmumu güvesi hasarı
- Sağlıklı kovan/arı

Eğer fotoğrafta net bir durum tespit edemiyorsan, bunu belirt ve daha iyi bir fotoğraf öneri.`

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'free') {
    return NextResponse.json(
      { error: 'Hastalık teşhisi premium özelliğidir.' },
      { status: 403 }
    )
  }

  const formData = await request.formData()
  const file = formData.get('photo') as File
  const hiveId = formData.get('hive_id') as string | null

  if (!file) return NextResponse.json({ error: 'Fotoğraf gereklidir' }, { status: 400 })

  // Fotoğrafı Supabase Storage'a yükle
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`
  const fileBuffer = await file.arrayBuffer()

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('diagnosis-photos')
    .upload(fileName, fileBuffer, { contentType: file.type })

  if (uploadError) return NextResponse.json({ error: 'Dosya yükleme hatası' }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('diagnosis-photos').getPublicUrl(fileName)

  // Fotoğrafı base64'e çevir (Claude Vision için)
  const base64 = Buffer.from(fileBuffer).toString('base64')
  const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp'

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: DIAGNOSE_PROMPT,
            },
          ],
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Beklenmeyen yanıt formatı')

    let diagnosis
    try {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      diagnosis = jsonMatch ? JSON.parse(jsonMatch[0]) : { condition: 'Analiz edilemedi', confidence: 0 }
    } catch {
      diagnosis = { condition: content.text, confidence: 0, severity: 'low' }
    }

    // Teşhisi kaydet
    const { data: savedDiagnosis } = await supabase
      .from('ai_disease_diagnoses')
      .insert({
        user_id: user.id,
        hive_id: hiveId || null,
        photo_url: uploadData.path,
        diagnosis,
        severity: diagnosis.severity || 'low',
      })
      .select()
      .single()

    return NextResponse.json({ diagnosis, photo_url: publicUrl, id: savedDiagnosis?.id })
  } catch (error) {
    console.error('Diagnosis error:', error)
    return NextResponse.json({ error: 'Analiz hatası' }, { status: 500 })
  }
}
