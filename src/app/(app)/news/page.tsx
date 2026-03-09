export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Newspaper } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export const metadata = { title: 'Haberler' }

export default async function NewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isPremium = profile?.role !== 'free'
  const limit = isPremium ? 20 : 3

  const { data: articles } = await supabase
    .from('news_articles')
    .select('id, title, slug, summary, category, image_url, is_breaking, published_at')
    .order('published_at', { ascending: false })
    .limit(limit)

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Haberler</h1>
        {!isPremium && (
          <Link href="/app/subscription" className="text-sm text-amber-600 hover:underline">
            Premium — Tümünü Gör
          </Link>
        )}
      </div>

      {!isPremium && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-sm text-amber-800">Ücretsiz planda sadece son 3 haber görünür.</p>
            <Link href="/app/subscription" className="text-sm font-medium text-amber-600 hover:underline">
              Premium ol
            </Link>
          </CardContent>
        </Card>
      )}

      {articles && articles.length > 0 ? (
        <div className="space-y-3">
          {articles.map(article => (
            <Link key={article.id} href={`/app/news/${article.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex gap-4">
                  {article.image_url && (
                    <div className="w-20 h-16 bg-muted rounded-lg shrink-0 overflow-hidden">
                      <Image
                        src={article.image_url}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {article.is_breaking && (
                        <Badge className="bg-red-500 text-white text-xs">Son Dakika</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">{article.category}</Badge>
                    </div>
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">{article.title}</h3>
                    {article.summary && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{article.summary}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(article.published_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
            <Newspaper className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">Henüz haber yok</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
