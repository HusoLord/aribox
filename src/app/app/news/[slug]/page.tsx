export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'free') {
    redirect('/app/subscription')
  }

  const { data: article } = await supabase
    .from('news_articles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!article) notFound()

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-4">
      <Link href="/app/news" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Haberlere Dön
      </Link>

      <article className="space-y-4">
        <div className="flex items-center gap-2">
          {article.is_breaking && (
            <Badge className="bg-red-500 text-white">Son Dakika</Badge>
          )}
          <Badge variant="outline">{article.category}</Badge>
          <span className="text-sm text-muted-foreground">{formatDate(article.published_at)}</span>
        </div>

        <h1 className="text-2xl font-bold">{article.title}</h1>

        {article.summary && (
          <p className="text-lg text-muted-foreground leading-relaxed">{article.summary}</p>
        )}

        {article.image_url && (
          <div className="w-full aspect-video bg-muted rounded-xl overflow-hidden">
            <Image src={article.image_url} alt={article.title} fill className="object-cover" />
          </div>
        )}

        <div className="prose prose-sm max-w-none">
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{article.content}</div>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {article.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        {article.source_url && (
          <Card className="bg-muted/50">
            <CardContent className="p-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Kaynak</span>
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-amber-600 hover:underline"
              >
                Kaynağa git <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        )}
      </article>

    </div>
  )
}
