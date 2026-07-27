import { z } from 'zod'

const orderTypeEnum = z.enum(['GRADE', 'PAR_A_PAR', 'SURFACADO'])

export const createOrderSchema = z.object({
  lensId: z.string().min(1, 'Lente é obrigatória'),
  orderType: orderTypeEnum,
  quantity: z.number().min(0.5, 'Quantidade mínima é 0,5 par'),
  filialId: z.string().optional(),
  clientOS: z.string().optional(),
  patientName: z.string().optional(),
  pedidoPor: z.string().optional(),
  notes: z.string().optional(),

  // Grade
  gradeData: z.record(z.number()).optional(),

  // Par a Par / Surfaçado
  odEsf: z.number().optional(),
  odCil: z.number().optional(),
  odEixo: z.number().min(0).max(180).optional(),
  odAdicao: z.number().optional(),
  odCentroOptico: z.number().optional(),
  odDnp: z.number().optional(),

  oeEsf: z.number().optional(),
  oeCil: z.number().optional(),
  oeEixo: z.number().min(0).max(180).optional(),
  oeAdicao: z.number().optional(),
  oeCentroOptico: z.number().optional(),
  oeDnp: z.number().optional(),

  // Surfaçado - Armação
  pa: z.number().optional(),
  am: z.number().optional(),
  vertical: z.number().optional(),
  frameFormat: z.string().optional(),

  selectedGrade: z.string().optional(),
}).refine((data) => {
  if (data.orderType === 'SURFACADO') {
    return data.odDnp !== undefined && data.oeDnp !== undefined
  }
  return true
}, {
  message: 'DNP é obrigatório para pedidos Surfaçados',
  path: ['odDnp'],
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['ACEITO', 'RECUSADO', 'CANCELADO']),
  reason: z.string().optional(),
}).refine((data) => {
  if (data.status === 'RECUSADO') {
    return data.reason && data.reason.length > 0
  }
  return true
}, {
  message: 'Motivo é obrigatório para recusa',
  path: ['reason'],
})

export const updateOrderSchema = z.object({
  clientOS: z.string().optional(),
  patientName: z.string().optional(),
  pedidoPor: z.string().optional(),
  notes: z.string().optional(),
  odEsf: z.number().optional(),
  odCil: z.number().optional(),
  odEixo: z.number().min(0).max(180).optional(),
  odAdicao: z.number().optional(),
  odCentroOptico: z.number().optional(),
  odDnp: z.number().optional(),
  oeEsf: z.number().optional(),
  oeCil: z.number().optional(),
  oeEixo: z.number().min(0).max(180).optional(),
  oeAdicao: z.number().optional(),
  oeCentroOptico: z.number().optional(),
  oeDnp: z.number().optional(),
  pa: z.number().optional(),
  am: z.number().optional(),
  vertical: z.number().optional(),
  frameFormat: z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>
