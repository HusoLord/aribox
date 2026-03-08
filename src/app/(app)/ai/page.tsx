'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Plus, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface Conversation {
  id: string
  title: string
  created_at: string
}

interface QuotaInfo {
  role: string
  daily_limit: number | null
  used: number | null
  remaining: number | null
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConvId, setCurrentConvId] = useState<string | null>(null)
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadQuota = useCallback(async () => {
    const res = await fetch('/api/ai/chat')
    if (res.ok) setQuota(await res.json())
  }, [])

  const loadConversations = useCallback(async () => {
    const res = await fetch('/api/ai/conversations')
    if (res.ok) setConversations(await res.json())
  }, [])

  useEffect(() => {
    loadQuota()
    loadConversations()
  }, [loadQuota, loadConversations])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function startNewConversation() {
    const res = await fetch('/api/ai/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Yeni Sohbet' }),
    })
    if (res.ok) {
      const conv = await res.json()
      setCurrentConvId(conv.id)
      setMessages([])
      setError(null)
      await loadConversations()
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    // İlk mesajda konuşma oluştur
    let convId = currentConvId
    if (!convId) {
      const res = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input.trim().slice(0, 50) }),
      })
      if (res.ok) {
        const conv = await res.json()
        convId = conv.id
        setCurrentConvId(conv.id)
        await loadConversations()
      }
    }

    const allMessages = [...messages, userMessage]

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          conversationId: convId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Bir hata oluştu')
        setLoading(false)
        return
      }

      // Streaming yanıt okuma
      const reader = res.body?.getReader()
      if (!reader) return

      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let accText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                accText += parsed.text
                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { ...assistantMessage, content: accText }
                  return updated
                })
              }
            } catch {
              // parse hatası görmezden gel
            }
          }
        }
      }

      await loadQuota()
    } catch {
      setError('Bağlantı hatası oluştu')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const suggestedQuestions = [
    'Varroa tedavisinde hangi yöntemi kullanmalıyım?',
    'İlkbahar kovan kontrolünde nelere dikkat etmeli?',
    'Ana arı nasıl değiştirilir?',
    'Bal hasadı için en uygun zaman nedir?',
  ]

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Sidebar — sohbet geçmişi */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-muted/30 shrink-0">
        <div className="p-3 border-b">
          <button
            onClick={startNewConversation}
            className="flex items-center gap-2 w-full rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-3 h-8 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Yeni Sohbet
          </button>
        </div>

        {quota && quota.role === 'free' && (
          <div className="p-3 border-b">
            <div className="text-xs text-muted-foreground mb-1">Günlük Hak</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-1.5">
                <div
                  className="bg-amber-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${((quota.used || 0) / (quota.daily_limit || 10)) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium">{quota.remaining}/{quota.daily_limit}</span>
            </div>
            <Link href="/app/subscription" className="text-xs text-amber-600 hover:underline mt-1 block">
              Premium&apos;a geç →
            </Link>
          </div>
        )}

        <ScrollArea className="flex-1 p-2">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setCurrentConvId(conv.id)}
              className={cn(
                'flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-0.5',
                conv.id === currentConvId
                  ? 'bg-amber-100 text-amber-700'
                  : 'hover:bg-muted text-muted-foreground'
              )}
            >
              <Bot className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{conv.title}</span>
            </button>
          ))}
        </ScrollArea>
      </aside>

      {/* Ana sohbet alanı */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <Bot className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">ARI — Arıcılık Asistanı</h1>
              <p className="text-xs text-muted-foreground">Claude Sonnet ile çalışır</p>
            </div>
          </div>
          <Link
            href="/app/ai/diagnose"
            className="text-xs bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg font-medium hover:bg-orange-100 transition-colors"
          >
            Hastalık Teşhisi
          </Link>
        </div>

        {/* Mesajlar */}
        <ScrollArea className="flex-1 px-4">
          <div className="max-w-3xl mx-auto py-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="p-4 bg-amber-50 rounded-2xl inline-block mb-4">
                  <Bot className="h-10 w-10 text-amber-500" />
                </div>
                <h2 className="font-semibold mb-2">Merhaba! Ben ARI.</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Arıcılık konusunda her sorunuzda yardımcıyım.
                </p>
                <div className="grid sm:grid-cols-2 gap-2 max-w-md mx-auto">
                  {suggestedQuestions.map(q => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="text-left text-xs p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'flex gap-3',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="p-1.5 bg-amber-100 rounded-lg h-fit shrink-0">
                    <Bot className="h-4 w-4 text-amber-600" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-amber-500 text-white rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  )}
                >
                  {msg.content}
                  {loading && i === messages.length - 1 && msg.role === 'assistant' && (
                    <span className="inline-block w-1.5 h-4 bg-current ml-0.5 animate-pulse" />
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="p-1.5 bg-muted rounded-lg h-fit shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-3">
                  <p className="text-sm text-red-600">{error}</p>
                  {error.includes('premium') && (
                    <Link href="/app/subscription" className="text-xs text-amber-600 hover:underline mt-1 block">
                      Premium&apos;a geç →
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4 shrink-0">
          <div className="max-w-3xl mx-auto flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Arıcılık sorunuzu yazın... (Enter ile gönder)"
              className="resize-none min-h-[44px] max-h-32"
              rows={1}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="bg-amber-500 hover:bg-amber-600 h-11 w-11 p-0 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Enter ile gönder • Shift+Enter ile yeni satır
          </p>
        </div>
      </div>
    </div>
  )
}
