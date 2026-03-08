'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Bot, Newspaper, MessageSquare, ShoppingBag,
  Home, Map, Cloud, Bell, Settings, Crown, BarChart3, Mail, Users, Rss
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'

const mainNav = [
  { href: '/app', icon: LayoutDashboard, label: 'Ana Sayfa', exact: true },
  { href: '/app/feed', icon: Rss, label: 'Sosyal Akış' },
  { href: '/app/users', icon: Users, label: 'Arıcılar' },
  { href: '/app/ai', icon: Bot, label: 'AI Asistan' },
  { href: '/app/news', icon: Newspaper, label: 'Haberler' },
  { href: '/app/forum', icon: MessageSquare, label: 'Forum' },
  { href: '/app/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  { href: '/app/messages', icon: Mail, label: 'Mesajlar' },
]

const toolsNav = [
  { href: '/app/hives', icon: Home, label: 'Kovan Defteri' },
  { href: '/app/map', icon: Map, label: 'Nektar Haritası' },
  { href: '/app/weather', icon: Cloud, label: 'Hava Durumu' },
  { href: '/app/ai/diagnose', icon: Bot, label: 'Hastalık Teşhisi' },
  { href: '/app/dashboard', icon: BarChart3, label: 'Analizler' },
]

const accountNav = [
  { href: '/app/notifications', icon: Bell, label: 'Bildirimler' },
  { href: '/app/subscription', icon: Crown, label: 'Abonelik' },
  { href: '/app/profile', icon: Settings, label: 'Profil' },
]

function NavGroup({ title, items }: { title: string; items: typeof mainNav }) {
  const pathname = usePathname()
  return (
    <div className="mb-4">
      <p className="px-3 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
      {items.map(({ href, icon: Icon, label, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5',
              isActive
                ? 'bg-amber-100 text-amber-700 font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </div>
  )
}

export default function Sidebar() {
  const { profile } = useUser()

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r bg-background h-[calc(100vh-56px)] sticky top-14 overflow-y-auto p-3">
      <NavGroup title="Genel" items={mainNav} />
      <NavGroup title="Araçlar" items={toolsNav} />
      {(profile?.role === 'producer' || profile?.role === 'admin') && (
        <NavGroup title="Üretici" items={[
          { href: '/app/producer/apply', icon: ShoppingBag, label: 'Üretici Profili' },
          { href: '/app/marketplace/sell', icon: BarChart3, label: 'Ürün Ekle' },
          { href: '/app/marketplace/orders', icon: LayoutDashboard, label: 'Siparişler' },
        ]} />
      )}
      {profile?.role === 'admin' && (
        <NavGroup title="Admin" items={[
          { href: '/admin', icon: BarChart3, label: 'Admin Paneli' },
        ]} />
      )}
      <NavGroup title="Hesap" items={accountNav} />
    </aside>
  )
}
