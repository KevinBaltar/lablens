import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { prisma } from '../index'
import { authenticate, requireMaster } from '../middleware/auth'

const router = Router()

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf']
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos'))
    }
  },
})

async function isPdf(filePath: string): Promise<boolean> {
  const handle = await fs.promises.open(filePath, 'r')
  try {
    const buffer = Buffer.alloc(5)
    await handle.read(buffer, 0, 5, 0)
    return buffer.toString('ascii') === '%PDF-'
  } finally {
    await handle.close()
  }
}

// Upload de tabela de preços
router.post('/', authenticate, requireMaster, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não fornecido' })
    }

    if (!await isPdf(req.file.path)) {
      await fs.promises.unlink(req.file.path)
      return res.status(400).json({ error: 'Arquivo PDF inválido' })
    }

    // Desativar tabela anterior
    await prisma.priceTable.updateMany({
      where: { active: true },
      data: { active: false },
    })

    // Criar nova tabela
    const priceTable = await prisma.priceTable.create({
      data: {
        filename: req.file.filename,
        originalName: path.basename(req.file.originalname).replace(/["\\\r\n]/g, '_'),
        path: req.file.path,
        mimeType: 'application/pdf',
        size: req.file.size,
        active: true,
      },
    })

    return res.status(201).json(priceTable)
  } catch (error) {
    console.error('Upload price table error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// Download da tabela ativa
router.get('/download', authenticate, async (req: Request, res: Response) => {
  try {
    const priceTable = await prisma.priceTable.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })

    if (!priceTable) {
      return res.status(404).json({ error: 'Nenhuma tabela de preços disponível' })
    }

    if (!fs.existsSync(priceTable.path)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' })
    }

    res.setHeader('Content-Type', priceTable.mimeType)
    res.setHeader('Content-Disposition', `attachment; filename="${priceTable.originalName}"`)

    const fileStream = fs.createReadStream(priceTable.path)
    fileStream.pipe(res)
  } catch (error) {
    console.error('Download price table error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// Listar tabelas (apenas ativa)
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const priceTable = await prisma.priceTable.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })

    return res.json(priceTable || null)
  } catch (error) {
    console.error('Get price table error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// Deletar tabela ativa
router.delete('/:id', authenticate, requireMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const priceTable = await prisma.priceTable.findUnique({
      where: { id },
    })

    if (!priceTable) {
      return res.status(404).json({ error: 'Tabela não encontrada' })
    }

    // Deletar arquivo físico
    if (fs.existsSync(priceTable.path)) {
      fs.unlinkSync(priceTable.path)
    }

    await prisma.priceTable.delete({ where: { id } })

    return res.status(204).send()
  } catch (error) {
    console.error('Delete price table error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router
