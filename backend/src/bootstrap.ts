import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const DEFAULT_MASTER_EMAIL = 'admin@lablens.com.br'
const DEFAULT_MASTER_PASSWORD = 'Admin@123456'
const MIN_PASSWORD_LENGTH = 12

export async function ensureMasterUser(prisma: PrismaClient): Promise<void> {
  try {
    const envEmail = process.env.MASTER_EMAIL
    const envPassword = process.env.MASTER_PASSWORD

    const email = envEmail || DEFAULT_MASTER_EMAIL
    let password = envPassword || DEFAULT_MASTER_PASSWORD

    if (password.length < MIN_PASSWORD_LENGTH) {
      console.warn(
        `[BOOTSTRAP] Senha do MASTER tem apenas ${password.length} caracteres. ` +
        `Mínimo exigido é ${MIN_PASSWORD_LENGTH}. Usando senha padrão segura.`,
      )
      password = DEFAULT_MASTER_PASSWORD
    }

    const existing = await prisma.user.findFirst({
      where: { role: 'MASTER' },
      select: { id: true, email: true },
    })

    if (existing) {
      console.log(
        `[BOOTSTRAP] Usuário MASTER já existe: ${existing.email} (ID: ${existing.id})`,
      )
      return
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const created = await prisma.user.create({
      data: {
        email,
        name: 'Administrador',
        password: hashedPassword,
        role: 'MASTER',
        filialId: null,
      },
      select: { id: true, email: true, createdAt: true },
    })

    console.log('')
    console.log('='.repeat(60))
    console.log('  [BOOTSTRAP] USUÁRIO MASTER CRIADO COM SUCESSO!')
    console.log('='.repeat(60))
    console.log(`  Email:    ${created.email}`)
    if (!envPassword) {
      console.log(`  Senha:    ${password} (PADRÃO - ALTERE IMEDIATAMENTE!)`)
    } else {
      console.log(`  Senha:    [VAREVEL MASTER_PASSWORD definida]`)
    }
    console.log(`  Criado em: ${created.createdAt.toLocaleString('pt-BR')}`)
    console.log('='.repeat(60))
    console.log('')
  } catch (error) {
    console.error('[BOOTSTRAP] Falha ao garantir usuário MASTER:', error)
    throw error
  }
}
