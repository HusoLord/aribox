export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MapPin, Star, Package, CheckCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default async function ProducerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: producer } = await supabase
    .from('producer_profiles')
    .select(`
      *,
      users(id, full_name, avatar_url),
      products(id, name, price, unit, images, category, is_organic, rating, review_count, is_active)
    `)
    .eq('id', id)
    .single()

  if (!producer) notFound()

  const producerUser = producer.users as { id: string; full_name: string; avatar_url: string | null }
  const products = (producer.products as Array<{
    id: string; name: string; price: number; unit: string;
    images: string[]; category: string; is_organic: boolean;
    rating: number; review_count: number; is_active: boolean
  }>).filter(p => p.is_active)

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-4">
      {/* Uretici Profili */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl bg-amber-200 text-amber-800">
                {producerUser?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{producer.farm_name}</h1>
                {producer.is_verified && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                <MapPin className="h-3.5 w-3.5" />
                {producer.location}
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm">
                {producer.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {Number(producer.rating).toFixed(1)}
                  </span>
                )}
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Package className="h-3.5 w-3.5" />
                  {products.length} ürün
                </span>
              </div>
            </div>
            {producerUser?.id !== user.id && (
              <Link
                href={`/app/messages?with=${producerUser?.id}`}
                className="text-sm font-medium text-amber-600 hover:underline shrink-0"
              >
                Mesaj Gönder
              </Link>
            )}
          </div>

          <p className="text-sm leading-relaxed mt-4">{producer.description}</p>

          {(producer.honey_types as string[])?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(producer.honey_types as string[]).map((type: string) => (
                <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Urunler */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ürünler ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {products.map(product => (
                <Link key={product.id} href={`/app/marketplace/product/${product.id}`}>
                  <div className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="aspect-square bg-amber-50 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                      {product.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="h-8 w-8 text-amber-300" />
                      )}
                    </div>
                    <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                    <p className="text-amber-600 font-semibold text-sm">{formatPrice(product.price)}/{product.unit}</p>
                    {product.is_organic && (
                      <Badge variant="outline" className="text-xs mt-1">Organik</Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Henüz ürün yok</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
