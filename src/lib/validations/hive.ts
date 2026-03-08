import { z } from 'zod'

export const hiveSchema = z.object({
  name: z.string().min(1, 'Kovan adı gereklidir'),
  hive_number: z.number().int().positive('Kovan numarası pozitif olmalıdır'),
  hive_type: z.enum(['langstroth', 'dadant', 'local', 'other']),
  location_name: z.string().optional(),
  queen_breed: z.string().optional(),
  queen_marking_color: z.string().optional(),
  colony_strength: z.enum(['weak', 'medium', 'strong']).optional(),
  notes: z.string().optional(),
})

export const inspectionSchema = z.object({
  inspection_date: z.string().min(1, 'Tarih gereklidir'),
  queen_seen: z.boolean(),
  disease_signs: z.boolean(),
  disease_notes: z.string().optional(),
  actions_taken: z.array(z.string()),
  notes: z.string().optional(),
  food_status: z.object({
    honey: z.enum(['empty', 'low', 'medium', 'full']).optional(),
    pollen: z.enum(['empty', 'low', 'medium', 'full']).optional(),
  }).optional(),
  brood_status: z.object({
    open_brood: z.boolean().optional(),
    capped_brood: z.boolean().optional(),
  }).optional(),
})

export type HiveInput = z.infer<typeof hiveSchema>
export type InspectionInput = z.infer<typeof inspectionSchema>
