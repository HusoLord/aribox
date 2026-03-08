import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag } from 'lucide-react'
import { formatPrice, formatRelativeTime } from '@/lib/utils'

export const metadata = { title: 'Siparişlerim' }

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: 'Bekliyor', variant: 'secondary' },
  confirmed: { label: 'Onaylandı', variant: 'default' },
  shipped: { label: 'Kargoda', variant: 'default' },
  delivered: { label: 'Teslim Edildi', variant: 'outline' },
  canceled: { label: 'İptal', variant: 'destructive' },
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, quantity, unit_price, total_price, status, created_at,
      products(name, images, unit)
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Siparişlerim</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map(order => {
            const product = order.products as unknown as { name: string; images: string[]; unit: string } | null
            const status = STATUS_LABELS[order.status] || { label: order.status, variant: 'secondary' as const }
            return (
              <Card key={order.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-14 h-14 bg-amber-50 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    {product?.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-6 w-6 text-amber-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.quantity} {product?.unit} × {formatPrice(order.unit_price)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(order.created_at)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm text-amber-600">{formatPrice(order.total_price)}</p>
                    <Badge variant={status.variant} className="text-xs mt-1">{status.label}</Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">Henüz siparişiniz yok</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
