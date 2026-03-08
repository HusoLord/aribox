'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Star, MapPin, Leaf, ShoppingBag, MessageSquare, CheckCircle } from 'lucide-react'
import { formatPrice, formatRelativeTime } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description: string
  price: number
  unit: string
  stock_quantity: number
  images: string[]
  category: string
  is_organic: boolean
  rating: number
  review_count: number
  producer_profiles: {
    farm_name: string
    location: string
    description: string
    is_verified: boolean
    rating: number
    users: { full_name: string; avatar_url: string | null }
  }
  product_reviews: Array<{
    id: string
    rating: number
    comment: string
    created_at: string
    users: { full_name: string }
  }>
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])


  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container max-w-3xl mx-auto p-4">
        <p className="text-muted-foreground text-center">Ürün bulunamadı</p>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-4">
      <Link href="/app/marketplace" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Pazar Yerine Dön
      </Link>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Görseller */}
        <div className="space-y-2">
          <div className="aspect-square bg-amber-50 rounded-xl overflow-hidden flex items-center justify-center">
            {product.images?.[selectedImage] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <ShoppingBag className="h-20 w-20 text-amber-300" />
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === selectedImage ? 'border-amber-500' : 'border-border'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bilgiler */}
        <div className="space-y-4">
          <div>
            <div className="flex items-start gap-2">
              <h1 className="text-xl font-bold flex-1">{product.name}</h1>
              {product.is_organic && (
                <Badge className="bg-green-500 text-white shrink-0">
                  <Leaf className="h-3 w-3 mr-1" />
                  Organik
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {formatPrice(product.price)}/{product.unit}
            </p>
            {product.rating > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{Number(product.rating).toFixed(1)}</span>
                <span>({product.review_count} yorum)</span>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Uretici */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium">{product.producer_profiles?.farm_name}</p>
                {product.producer_profiles?.is_verified && (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {product.producer_profiles?.location}
              </div>
            </div>
            <Link
              href={`/api/messages?new=${product.producer_profiles?.users?.full_name}`}
              className="flex items-center gap-1 text-xs text-amber-600 hover:underline"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Mesaj
            </Link>
          </div>

          {/* Siparis */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Miktar</label>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1 text-muted-foreground hover:text-foreground"
                  >-</button>
                  <span className="px-3 py-1 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                    className="px-3 py-1 text-muted-foreground hover:text-foreground"
                  >+</button>
                </div>
                <span className="text-xs text-muted-foreground">Stok: {product.stock_quantity} {product.unit}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="font-semibold">
                  Toplam: {formatPrice(product.price * quantity)}
                </p>
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
                <p className="text-sm text-amber-800 font-medium">Ödeme sistemi yakında aktif olacak</p>
                <p className="text-xs text-amber-600 mt-1">Satın almak için üreticiye mesaj gönderin</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Yorumlar */}
      {product.product_reviews?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Yorumlar ({product.product_reviews.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {product.product_reviews.map(review => (
              <div key={review.id} className="border-b last:border-0 pb-3 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{review.users?.full_name}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">{formatRelativeTime(review.created_at)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
