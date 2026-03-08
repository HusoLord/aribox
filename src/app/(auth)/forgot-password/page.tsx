'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="text-5xl mb-4">📧</div>
            <CardTitle>Bağlantı Gönderildi</CardTitle>
            <CardDescription>
              Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button variant="outline" className="w-full">Giriş Sayfasına Dön</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Şifremi Unuttum</CardTitle>
          <CardDescription>
            E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600"
              disabled={loading}
            >
              {loading ? 'Gönderiliyor...' : 'Bağlantı Gönder'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600">
            <Link href="/login" className="text-amber-600 hover:underline">
              Giriş sayfasına dön
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
