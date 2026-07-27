import { beforeAll, afterAll, afterEach } from 'vitest'
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

beforeAll(async () => {
  // Conectar ao banco de testes
  await prisma.$connect()
})

afterAll(async () => {
  // Desconectar do banco
  await prisma.$disconnect()
})

afterEach(async () => {
  // Limpar dados de teste após cada teste
  await prisma.chatMessage.deleteMany()
  await prisma.chat.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.statusHistory.deleteMany()
  await prisma.order.deleteMany()
  await prisma.lensGrade.deleteMany()
  await prisma.lens.deleteMany()
  await prisma.user.deleteMany()
  await prisma.filial.deleteMany()
  await prisma.contact.deleteMany()
})
