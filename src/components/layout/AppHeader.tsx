'use client'

import Link from 'next/link'
import { Bell, MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/hooks/useUser'
import { ADMIN_EMAIL, DEFAULT_USER_ROLE } from '@/lib/constants'

export default function AppHeader() {
  const { profile } = useUser()

  const isAdmin = profile?.email === ADMIN_EMAIL || profile?.role === 'admin'
  const effectiveRole =
    !profile ? 'free' :
    isAdmin ? 'admin' :
    profile.role || DEFAULT_USER_ROLE

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error', error)
    } finally {
      window.location.href = '/login'
    }
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/app" className="flex items-center gap-2">
            <span className="text-xl font-bold text-amber-600">ARIBox</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/app/notifications" className="inline-flex items-center justify-center rounded-lg h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Bell className="h-5 w-5" />
          </Link>

          <Link href="/app/messages" className="inline-flex items-center justify-center rounded-lg h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <MessageSquare className="h-5 w-5" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full outline-none">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email}</p>
                    {profile && (
                      <Badge variant="secondary" className="w-fit text-xs capitalize">
                        {effectiveRole === 'free' ? 'Ücretsiz' :
                          effectiveRole === 'premium' ? 'Premium' :
                            effectiveRole === 'producer' ? 'Üretici' : 'Admin'}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/app/profile" className="w-full">Profil Ayarları</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/app/subscription" className="w-full">Abonelik</Link>
              </DropdownMenuItem>
              {profile?.role === 'producer' && (
                <DropdownMenuItem>
                  <Link href="/app/producer/dashboard" className="w-full">Üretici Paneli</Link>
                </DropdownMenuItem>
              )}
              {isAdmin && (
                <DropdownMenuItem>
                  <Link href="/admin" className="w-full">Admin Paneli</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={(e) => {
                  e.preventDefault()
                  handleLogout()
                }}
              >
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

