import { z } from 'zod'

export const createClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  cpf: z.string().min(11, 'CPF inválido').max(14).optional(),
  email: z.string().email('Email inválido').optional().nullable(),
  phone: z.string().min(10, 'Telefone inválido'),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().length(2, 'Estado deve ter 2 caracteres').optional().nullable(),
  zipCode: z.string().min(8, 'CEP inválido').max(9).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const updateClientSchema = createClientSchema.partial()

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
