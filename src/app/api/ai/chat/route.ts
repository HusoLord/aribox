import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { FREE_DAILY_QUESTION_LIMIT } from '@/lib/constants'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Sen ARIBox platformunun yapay zeka asistanı "ARI"sın. Türkiye'nin önde gelen arıcılık uzmanısın.

UZMANLIK ALANLARIN:
- Kovan Bakımı: Kontrol listeleri, bakım takvimi, kovan düzeni, çerçeve yönetimi
- Ana Arı: Ana arı yetiştirme, değiştirme, işaretleme, kalite değerlendirme
- Bal Hasadı: Hasat zamanlaması, süzme teknikleri, depolama, nem ölçümü
- Arı Hastalıkları: Varroa, nosema, Amerikan yavru çürüklüğü, tedavi protokolleri
- Çiçek ve Bitki: Nektar kaynakları, çiçeklenme takvimleri, bölgesel flora
- Arı Ürünleri: Propolis, arı sütü, polen, bal mumu, apiterapi
- Mevsimsel Yönetim: İlkbahar açılışı, yaz yönetimi, sonbahar hazırlığı, kışlama
- Ekipman: Kovan tipleri (Langstroth, Dadant), koruyucu ekipman, hasat araçları
- Mevzuat: Arıcılık yönetmeliği, gıda mevzuatı, desteklemeler, sigorta

DAVRANIŞ KURALLARI:
- Her zaman Türkçe konuş
- Kısa, net ve pratik yanıtlar ver
- Bilimsel bilgiyi kullanıcı dostu dille anlat
- Tıbbi/veteriner konularda uzman görüşü öner
- Arıcılık dışı konularda kibarca reddet
- Kaynak ve referans göster (gerektiğinde)`

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role, daily_question_count, daily_question_reset_at')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
  }

  const isFree = profile.role === 'free'

  // Serbest kullanıcı günlük limit kontrolü
  if (isFree) {
    const resetAt = profile.daily_question_reset_at
      ? new Date(profile.daily_question_reset_at)
      : null
    const now = new Date()

    // Gün sıfırlama
    if (!resetAt || now.toDateString() !== resetAt.toDateString()) {
      await supabase
        .from('users')
        .update({ daily_question_count: 0, daily_question_reset_at: now.toISOString() })
        .eq('id', user.id)
      profile.daily_question_count = 0
    }

    if (profile.daily_question_count >= FREE_DAILY_QUESTION_LIMIT) {
      return NextResponse.json(
        { error: 'Günlük soru hakkınızı kullandınız. Premium üyeliğe geçerek sınırsız soru sorabilirsiniz.' },
        { status: 429 }
      )
    }
  }

  const body = await request.json()
  const { messages, conversationId } = body as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
    conversationId?: string
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Geçersiz mesaj formatı' }, { status: 400 })
  }

  const lastMessage = messages[messages.length - 1]
  if (!lastMessage || lastMessage.role !== 'user') {
    return NextResponse.json({ error: 'Son mesaj kullanıcıdan gelmelidir' }, { status: 400 })
  }

  try {
    // Streaming yanıt
    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    })

    // Ücretsiz kullanıcı soru sayacını artır
    if (isFree) {
      await supabase
        .from('users')
        .update({ daily_question_count: profile.daily_question_count + 1 })
        .eq('id', user.id)
    }

    // SSE stream oluştur
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        let fullText = ''

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const text = event.delta.text
            fullText += text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
          if (event.type === 'message_stop') {
            // Sohbeti Supabase'e kaydet
            if (conversationId) {
              const { data: conv } = await supabase
                .from('ai_conversations')
                .select('messages')
                .eq('id', conversationId)
                .eq('user_id', user.id)
                .single()

              if (conv) {
                const updatedMessages = [
                  ...(conv.messages as Array<{ role: string; content: string; created_at: string }>),
                  { role: 'user', content: lastMessage.content, created_at: new Date().toISOString() },
                  { role: 'assistant', content: fullText, created_at: new Date().toISOString() },
                ]
                await supabase
                  .from('ai_conversations')
                  .update({ messages: updatedMessages })
                  .eq('id', conversationId)
              }
            }

            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          }
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'AI yanıt hatası' }, { status: 500 })
  }
}

// Günlük limit durumunu döndür
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role, daily_question_count, daily_question_reset_at')
    .eq('id', user.id)
    .single()

  const isFree = profile?.role === 'free'
  const remaining = isFree
    ? Math.max(0, FREE_DAILY_QUESTION_LIMIT - (profile?.daily_question_count || 0))
    : null

  return NextResponse.json({
    role: profile?.role,
    daily_limit: isFree ? FREE_DAILY_QUESTION_LIMIT : null,
    used: isFree ? profile?.daily_question_count : null,
    remaining,
    reset_at: profile?.daily_question_reset_at,
  })
}
