export type UserRole = 'free' | 'premium' | 'producer' | 'admin'
export type SubscriptionStatus = 'active' | 'canceled' | 'expired'
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type HiveType = 'langstroth' | 'dadant' | 'local' | 'other'
export type ColonyStrength = 'weak' | 'medium' | 'strong'
export type HiveStatus = 'active' | 'inactive' | 'dead' | 'sold'
export type NectarQuality = 'low' | 'medium' | 'high'
export type DiagnosisSeverity = 'low' | 'medium' | 'high' | 'critical'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'canceled' | 'refunded'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'
export type SubscriptionPlan = 'monthly' | 'yearly'
export type PostType = 'photo' | 'video' | 'story' | 'article'

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  city: string | null
  role: UserRole
  subscription_status: SubscriptionStatus | null
  stripe_customer_id: string | null
  daily_question_count: number
  daily_question_reset_at: string | null
  created_at: string
  updated_at: string
}

export interface ProducerProfile {
  id: string
  user_id: string
  business_name: string
  description: string | null
  cover_photo_url: string | null
  experience_years: number | null
  hive_count: number | null
  production_capacity: string | null
  certificates: Record<string, unknown> | null
  social_links: Record<string, string> | null
  verification_status: VerificationStatus
  verification_documents: Record<string, unknown> | null
  tax_id: string | null
  iban: string | null
  stripe_connect_id: string | null
  rating_avg: number
  rating_count: number
  follower_count: number
  created_at: string
  updated_at: string
}

export interface Hive {
  id: string
  user_id: string
  name: string
  hive_number: number
  hive_type: HiveType
  location_name: string | null
  queen_age: string | null
  queen_breed: string | null
  queen_marking_color: string | null
  colony_strength: ColonyStrength | null
  status: HiveStatus
  photo_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface HiveInspection {
  id: string
  hive_id: string
  user_id: string
  inspection_date: string
  weather_temp: number | null
  weather_condition: string | null
  queen_seen: boolean
  brood_status: Record<string, unknown> | null
  food_status: Record<string, unknown> | null
  disease_signs: boolean
  disease_notes: string | null
  actions_taken: string[]
  notes: string | null
  photos: string[]
  created_at: string
  updated_at: string
}

export interface AiConversation {
  id: string
  user_id: string
  title: string
  category: string | null
  messages: Array<{ role: 'user' | 'assistant'; content: string; created_at: string }>
  created_at: string
  updated_at: string
}

export interface NewsArticle {
  id: string
  title: string
  slug: string
  content: string
  summary: string | null
  category: string
  tags: string[]
  source_url: string | null
  image_url: string | null
  is_breaking: boolean
  published_at: string
  created_at: string
  updated_at: string
}

export interface ForumTopic {
  id: string
  category_id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  is_pinned: boolean
  is_locked: boolean
  view_count: number
  reply_count: number
  like_count: number
  last_reply_at: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  producer_id: string
  name: string
  slug: string
  description: string
  category: string
  price: number
  sale_price: number | null
  currency: string
  stock_quantity: number
  images: string[]
  harvest_date: string | null
  harvest_location: string | null
  origin_region: string | null
  qr_code_url: string | null
  is_active: boolean
  is_featured: boolean
  rating_avg: number
  rating_count: number
  sales_count: number
  shipping_info: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  buyer_id: string
  seller_id: string
  items: Record<string, unknown>
  subtotal: number
  commission_amount: number
  shipping_cost: number
  total: number
  status: OrderStatus
  shipping_address: Record<string, unknown>
  tracking_number: string | null
  stripe_payment_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface NectarMapEntry {
  id: string
  user_id: string
  plant_name: string
  plant_type: string | null
  bloom_start: string | null
  bloom_end: string | null
  nectar_quality: NectarQuality
  photo_url: string | null
  notes: string | null
  is_verified: boolean
  created_at: string
  updated_at: string
}
