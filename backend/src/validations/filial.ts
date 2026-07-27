import { z } from 'zod'

export const createFilialSchema = z.object({
  cnpj: z.string().min(14, 'CNPJ inválido').max(18),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  address: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres'),
  contact: z.string().min(2, 'Contato deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
})

export const updateFilialSchema = createFilialSchema.partial()

export type CreateFilialInput = z.infer<typeof createFilialSchema>
export type UpdateFilialInput = z.infer<typeof updateFilialSchema>
