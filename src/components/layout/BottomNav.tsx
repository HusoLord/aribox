'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Bot, MessageSquare, ShoppingBag, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/app', icon: LayoutDashboard, label: 'Ana Sayfa', exact: true },
  { href: '/app/ai', icon: Bot, label: 'AI Asistan' },
  { href: '/app/forum', icon: MessageSquare, label: 'Forum' },
  { href: '/app/marketplace', icon: ShoppingBag, label: 'Market' },
  { href: '/app/profile', icon: User, label: 'Profil' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, icon: Icon, label, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors',
                isActive
                  ? 'text-amber-600'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'fill-amber-100')} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
