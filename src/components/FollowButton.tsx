'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface FollowButtonProps {
  targetUserId: string
  initialFollowing: boolean
  className?: string
}

export default function FollowButton({ targetUserId, initialFollowing, className }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch('/api/follow', {
        method: following ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following_id: targetUserId }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'İşlem başarısız'); return }
      setFollowing(data.following)
      toast.success(data.following ? 'Takip edildi' : 'Takip bırakıldı')
    } catch {
      toast.error('Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={className ?? `text-sm rounded-lg px-4 h-8 font-medium transition-colors disabled:opacity-50 ${
        following
          ? 'border border-border hover:bg-muted'
          : 'bg-amber-500 hover:bg-amber-600 text-white'
      }`}
    >
      {loading ? '...' : following ? 'Takip Ediliyor' : 'Takip Et'}
    </button>
  )
}
