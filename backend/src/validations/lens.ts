import { z } from 'zod'

const lensTypeEnum = z.enum(['VISAO_SIMPLES_PRONTA', 'VISAO_SIMPLES_SURFACADA', 'PROGRESSIVA', 'BIFOCAL'])
const gradeCategoryEnum = z.enum(['POSITIVA', 'NEGATIVA'])

export const createLensGradeSchema = z.object({
  category: gradeCategoryEnum,
  esfericoMin: z.number(),
  esfericoMax: z.number(),
  cilindricoMin: z.number(),
  cilindricoMax: z.number(),
  step: z.number().default(0.25),
})

export const createLensSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  type: lensTypeEnum,
  addition: z.number().optional(),
  grades: z.array(createLensGradeSchema).min(1, 'Pelo menos uma grade é obrigatória'),
}).refine((data) => {
  if ((data.type === 'PROGRESSIVA' || data.type === 'BIFOCAL') && data.addition === undefined) {
    return false
  }
  return true
}, {
  message: 'Adição é obrigatória para lentes Progressivas e Bifocais',
})

export const updateLensSchema = z.object({
  name: z.string().min(2).optional(),
  type: lensTypeEnum.optional(),
  addition: z.number().optional(),
})

export type CreateLensInput = z.infer<typeof createLensSchema>
export type UpdateLensInput = z.infer<typeof updateLensSchema>
