export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, Users, Package, Newspaper } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/app')

  const navItems = [
    { href: '/admin', icon: Shield, label: 'Genel Bakış' },
    { href: '/admin/users', icon: Users, label: 'Kullanıcılar' },
    { href: '/admin/producers', icon: Package, label: 'Üreticiler' },
    { href: '/admin/news', icon: Newspaper, label: 'Haberler' },
  ]

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r bg-muted/30 p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-4 p-2">
          <Shield className="h-5 w-5 text-amber-500" />
          <span className="font-bold text-sm">Admin Panel</span>
        </div>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
        <div className="mt-auto">
          <Link href="/app" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
            ← Uygulamaya Dön
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
