'use client'

import { useState, useTransition } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  articleId: string
  initialBookmarked: boolean
}

export function BookmarkButton({ articleId, initialBookmarked }: Props) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  function toggleBookmark() {
    startTransition(async () => {
      const action = bookmarked ? 'remove' : 'add'
      const res = await fetch('/api/news/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, action }),
      })

      if (!res.ok) return
      const data = await res.json()
      if (typeof data.bookmarked === 'boolean') {
        setBookmarked(data.bookmarked)
      }
    })
  }

  return (
    <Button
      type="button"
      variant={bookmarked ? 'secondary' : 'outline'}
      size="sm"
      disabled={isPending}
      onClick={toggleBookmark}
    >
      {bookmarked ? (
        <>
          <BookmarkCheck className="h-4 w-4 mr-1" />
          Arşivde
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4 mr-1" />
          Arşive Kaydet
        </>
      )}
    </Button>
  )
}

