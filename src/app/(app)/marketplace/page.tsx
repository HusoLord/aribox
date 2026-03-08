import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ShoppingBag, Star, MapPin, Leaf } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export const metadata = { title: 'Pazar Yeri' }

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { search = '', category = '' } = await searchParams

  let query = supabase
    .from('products')
    .select(`
      id, name, price, unit, images, category, is_organic, rating, review_count,
      producer_profiles(farm_name, location, is_verified)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(24)

  if (search) query = query.ilike('name', `%${search}%`)
  if (category) query = query.eq('category', category)

  const { data: products } = await query

  const categories = ['bal', 'balmumu', 'propolis', 'arı_sütü', 'petek', 'ekipman', 'diğer']

  return (
    <div className="container max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pazar Yeri</h1>
        <Link
          href="/app/marketplace/sell"
          className="text-sm font-medium text-amber-600 hover:underline"
        >
          Ürün Sat
        </Link>
      </div>

      {/* Arama ve filtre */}
      <div className="flex gap-2">
        <form className="flex-1">
          <Input
            name="search"
            defaultValue={search}
            placeholder="Ürün ara..."
            className="w-full"
          />
        </form>
      </div>

      {/* Kategoriler */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/app/marketplace"
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !category ? 'bg-amber-500 text-white border-amber-500' : 'border-border hover:bg-muted'
          }`}
        >
          Tümü
        </Link>
        {categories.map(cat => (
          <Link
            key={cat}
            href={`/app/marketplace?category=${cat}`}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              category === cat ? 'bg-amber-500 text-white border-amber-500' : 'border-border hover:bg-muted'
            }`}
          >
            {cat.replace('_', ' ')}
          </Link>
        ))}
      </div>

      {/* Ürünler */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map(product => {
            const producer = product.producer_profiles as unknown as { farm_name: string; location: string; is_verified: boolean } | null
            return (
              <Link key={product.id} href={`/app/marketplace/product/${product.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-3">
                    <div className="aspect-square bg-amber-50 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                      {(product.images as string[])?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={(product.images as string[])[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="h-10 w-10 text-amber-300" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                        {product.is_organic && (
                          <Leaf className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                        )}
                      </div>
                      <p className="text-amber-600 font-semibold text-sm">
                        {formatPrice(product.price)}/{product.unit}
                      </p>
                      {producer && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{producer.location}</span>
                          {producer.is_verified && (
                            <Badge variant="secondary" className="text-xs px-1 py-0 ml-auto shrink-0">
                              Dogrulandi
                            </Badge>
                          )}
                        </div>
                      )}
                      {product.rating && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{Number(product.rating).toFixed(1)}</span>
                          <span>({product.review_count})</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">Ürün bulunamadı</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
