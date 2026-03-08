'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface Contact {
  id: string
  full_name: string
  avatar_url: string | null
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  is_read: boolean
}

function MessagesContent() {
  const searchParams = useSearchParams()
  const withParam = searchParams.get('with')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setCurrentUserId(d?.id)).catch(() => {})
    fetch('/api/messages').then(r => r.json()).then(setContacts).catch(() => {})
  }, [])

  useEffect(() => {
    if (withParam && contacts.length > 0) {
      const contact = contacts.find(c => c.id === withParam)
      if (contact) setSelectedContact(contact)
    }
  }, [withParam, contacts])

  useEffect(() => {
    if (!selectedContact) return
    const load = () => {
      fetch(`/api/messages?with=${selectedContact.id}`)
        .then(r => r.json())
        .then(setMessages)
        .catch(() => {})
    }
    load()
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [selectedContact])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: selectedContact.id, content: newMessage }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages(prev => [...prev, data])
      setNewMessage('')
    } catch {
      toast.error('Mesaj gönderilemedi')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 h-[calc(100vh-120px)] flex gap-4">
      {/* Kisi listesi */}
      <div className="w-64 shrink-0">
        <Card className="h-full">
          <CardContent className="p-0">
            <div className="p-3 border-b">
              <h2 className="font-semibold text-sm">Mesajlar</h2>
            </div>
            {contacts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Henüz mesaj yok</p>
              </div>
            ) : (
              <div className="divide-y">
                {contacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors ${
                      selectedContact?.id === contact.id ? 'bg-muted' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                        {contact.full_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate">{contact.full_name}</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mesajlasma alani */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                  {selectedContact.full_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">{selectedContact.full_name}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isMine = msg.sender_id === currentUserId
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                        isMine
                          ? 'bg-amber-500 text-white rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t flex gap-2">
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Mesajınızı yazın..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg px-3 h-9 flex items-center gap-1 text-sm transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Bir kişi seçin</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="container max-w-4xl mx-auto p-4"><div className="animate-pulse h-96 bg-muted rounded-xl" /></div>}>
      <MessagesContent />
    </Suspense>
  )
}
