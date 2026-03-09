'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterInput) {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      const msg = error.message
      if (msg === 'User already registered') {
        setError('Bu e-posta adresi zaten kayıtlı.')
      } else if (msg.includes('rate') || msg.includes('over_email_send_rate_limit') || error.status === 429) {
        setError('Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyip tekrar deneyin.')
      } else if (msg.includes('invalid') && msg.includes('email')) {
        setError('Geçersiz e-posta adresi.')
      } else if (msg.includes('password') && msg.includes('6')) {
        setError('Şifre en az 6 karakter olmalıdır.')
      } else {
        setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.')
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="text-5xl mb-4">📧</div>
            <CardTitle>E-postanızı Doğrulayın</CardTitle>
            <CardDescription>
              Kayıt işleminizi tamamlamak için e-posta adresinize gönderilen bağlantıya tıklayın.
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
    <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">ARIBox</div>
          <CardTitle className="text-2xl">Kayıt Ol</CardTitle>
          <CardDescription>Ücretsiz hesap oluşturun</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Ad Soyad</Label>
              <Input
                id="full_name"
                placeholder="Ahmet Yılmaz"
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="text-sm text-red-500">{errors.full_name.message}</p>
              )}
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="En az 8 karakter"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Şifre Tekrar</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="Şifrenizi tekrar girin"
                {...register('confirm_password')}
              />
              {errors.confirm_password && (
                <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600"
              disabled={loading}
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Kayıt olarak{' '}
            <Link href="/terms" className="text-amber-600 hover:underline">Kullanım Şartları</Link>
            {' '}ve{' '}
            <Link href="/privacy" className="text-amber-600 hover:underline">Gizlilik Politikası</Link>
            &apos;nı kabul etmiş olursunuz.
          </p>

          <p className="text-center text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-amber-600 hover:underline font-medium">
              Giriş Yap
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
