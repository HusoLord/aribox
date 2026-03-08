import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
})

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirm_password'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
