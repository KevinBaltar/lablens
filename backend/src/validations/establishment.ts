import { z } from 'zod'

const establishmentTypeEnum = z.enum(['LABORATORIO', 'FILIAL', 'DEPOSITO', 'OUTROS'])

export const createEstablishmentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  type: establishmentTypeEnum,
  cnpj: z.string().min(14, 'CNPJ inválido').max(18).optional().nullable(),
  address: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  zipCode: z.string().min(8, 'CEP inválido').max(9).optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
  responsible: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const updateEstablishmentSchema = createEstablishmentSchema.partial()

export type CreateEstablishmentInput = z.infer<typeof createEstablishmentSchema>
export type UpdateEstablishmentInput = z.infer<typeof updateEstablishmentSchema>
