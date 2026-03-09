export const ADMIN_EMAIL = 'vizara34@gmail.com'
export const DEFAULT_USER_ROLE = 'premium' as const

export const APP_NAME = 'ARIBox'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
export const APP_DESCRIPTION = 'Arıcılık sektörüne yönelik yapay zeka destekli kapsamlı dijital platform'

export const FREE_DAILY_QUESTION_LIMIT = 10
export const RATE_LIMIT_PER_MINUTE = 5
export const PLATFORM_COMMISSION_RATE = 0.08 // %8

export const HIVE_TYPES = {
  langstroth: 'Langstroth',
  dadant: 'Dadant',
  local: 'Yerli Kovan',
  other: 'Diğer',
} as const

export const COLONY_STRENGTHS = {
  weak: 'Zayıf',
  medium: 'Orta',
  strong: 'Güçlü',
} as const

export const NECTAR_QUALITIES = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
} as const

export const ORDER_STATUSES = {
  pending: 'Bekliyor',
  confirmed: 'Onaylandı',
  shipped: 'Kargoya Verildi',
  delivered: 'Teslim Edildi',
  canceled: 'İptal Edildi',
  refunded: 'İade Edildi',
} as const

export const PRODUCT_CATEGORIES = [
  'Bal',
  'Arı Ürünleri',
  'Arıcılık Ekipmanları',
  'Kovan ve Malzemeleri',
  'Ana Arı ve Koloni',
  'Kitap ve Eğitim',
] as const

export const FORUM_CATEGORIES = [
  'Genel Arıcılık Sohbetleri',
  'Kovan Bakımı ve Yönetim',
  'Hastalık ve Tedavi',
  'Bal Hasadı ve İşleme',
  'Ana Arı Yetiştiriciliği',
  'Ekipman ve Teknoloji',
  'Arı Ürünleri',
  'Pazar ve Ticaret',
  'Yeni Başlayanlar',
  'Bölgesel Gruplar',
] as const

export const BRAND_COLORS = {
  primary: '#F59E0B',    // amber-500
  secondary: '#22C55E',  // green-500
  background: '#FFFBEB', // amber-50
  dark: '#451A03',       // amber-950
  accent: '#EA580C',     // orange-600
} as const
