'use client'

import { useState, useEffect, useCallback } from 'react'
import { Send, Trash2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  users: { full_name: string | null } | null
}

export default function NewsComments({
  articleId,
  currentUserId,
}: {
  articleId: string
  currentUserId: string
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/news/comments?articleId=${articleId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(Array.isArray(data) ? data : [])
      }
    } catch {
      // tablo henüz yoksa sessizce geç
    }
  }, [articleId])

  useEffect(() => { load() }, [load])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/news/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, content: trimmed }),
      })
      if (!res.ok) {
        const data = await res.json()
        setErrorMsg(data.error || 'Yorum eklenemedi')
        return
      }
      setInput('')
      await load()
    } catch {
      setErrorMsg('Bağlantı hatası')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/news/comments?id=${id}`, { method: 'DELETE' })
      if (res.ok) setComments(prev => prev.filter(c => c.id !== id))
    } catch { /* ignore */ }
  }

  return (
    <div className="border rounded-xl bg-card">
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Yorumlar ({comments.length})</h3>
      </div>

      <div className="p-4 space-y-4">
        <form onSubmit={submit} className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Yorumunuzu yazın..."
            rows={2}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[60px] max-h-28"
          />
          <button
            type="submit"
            disabled={!input.trim() || submitting}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-lg h-10 w-10 flex items-center justify-center shrink-0 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        {errorMsg && (
          <p className="text-xs text-red-600">{errorMsg}</p>
        )}

        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-3">
            Henüz yorum yok. İlk yorumu siz yapın!
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-xs font-bold text-amber-700">
                  {comment.users?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium">{comment.users?.full_name || 'Kullanıcı'}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                      {comment.user_id === currentUserId && (
                        <button
                          type="button"
                          onClick={() => handleDelete(comment.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm mt-0.5 break-words">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
