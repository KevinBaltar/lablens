import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { prisma } from '../index'
import { authenticate, requireMaster } from '../middleware/auth'

const router = Router()

const isServerless = !!process.env.VERCEL

const storage = isServerless
  ? multer.memoryStorage()
  : multer.diskStorage({
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

const MAX_SIZE_BYTES = 8 * 1024 * 1024

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_SIZE_BYTES,
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

function fileBufferFrom(file: Express.Multer.File): Buffer | null {
  if (Buffer.isBuffer((file as any).buffer)) {
    return (file as any).buffer
  }
  if (file.path && fs.existsSync(file.path)) {
    try {
      return fs.readFileSync(file.path)
    } catch {
      return null
    }
  }
  return null
}

function isPdfBuffer(buffer: Buffer): boolean {
  if (buffer.length < 5) return false
  return buffer.subarray(0, 5).toString('ascii') === '%PDF-'
}

async function cleanupLocalFile(file: Express.Multer.File) {
  try {
    if (file.path && fs.existsSync(file.path)) {
      await fs.promises.unlink(file.path)
    }
  } catch {
    // ignore
  }
}

router.post('/', authenticate, requireMaster, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não fornecido' })
    }

    const fileBuffer = fileBufferFrom(req.file)
    if (!fileBuffer) {
      await cleanupLocalFile(req.file)
      return res.status(400).json({ error: 'Não foi possível ler o arquivo enviado' })
    }

    if (fileBuffer.length > MAX_SIZE_BYTES) {
      await cleanupLocalFile(req.file)
      return res.status(400).json({ error: `Arquivo excede o tamanho máximo permitido de ${MAX_SIZE_BYTES / (1024 * 1024)}MB` })
    }

    if (!isPdfBuffer(fileBuffer)) {
      await cleanupLocalFile(req.file)
      return res.status(400).json({ error: 'Apenas arquivos PDF válidos são permitidos' })
    }

    await prisma.priceTable.updateMany({
      where: { active: true },
      data: { active: false },
    })

    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.pdf`
    const originalName = path.basename(req.file.originalname).replace(/["\\\r\n]/g, '_')

    const priceTable = await prisma.priceTable.create({
      data: {
        filename,
        originalName,
        path: req.file.path || null,
        mimeType: 'application/pdf',
        size: fileBuffer.length,
        data: Buffer.from(fileBuffer),
        active: true,
      },
      select: {
        id: true,
        originalName: true,
        size: true,
        mimeType: true,
        active: true,
        createdAt: true,
      },
    })

    await cleanupLocalFile(req.file)

    return res.status(201).json(priceTable)
  } catch (error) {
    console.error('Upload price table error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.get('/download', authenticate, async (req: Request, res: Response) => {
  try {
    const priceTable = await prisma.priceTable.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })

    if (!priceTable) {
      return res.status(404).json({ error: 'Nenhuma tabela de preços disponível' })
    }

    const safeName = priceTable.originalName.replace(/["\\\r\n]/g, '_') || 'tabela-precos.pdf'

    if (Buffer.isBuffer(priceTable.data) && priceTable.data.length > 0) {
      res.setHeader('Content-Type', priceTable.mimeType)
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`)
      res.setHeader('Content-Length', String(priceTable.data.length))
      return res.end(priceTable.data)
    }

    if (priceTable.path && fs.existsSync(priceTable.path)) {
      res.setHeader('Content-Type', priceTable.mimeType)
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`)
      const fileStream = fs.createReadStream(priceTable.path)
      return fileStream.pipe(res)
    }

    return res.status(404).json({ error: 'Arquivo não encontrado' })
  } catch (error) {
    console.error('Download price table error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const priceTable = await prisma.priceTable.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        size: true,
        mimeType: true,
        active: true,
        createdAt: true,
      },
    })

    return res.json(priceTable || null)
  } catch (error) {
    console.error('Get price table error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.delete('/:id', authenticate, requireMaster, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const priceTable = await prisma.priceTable.findUnique({
      where: { id },
    })

    if (!priceTable) {
      return res.status(404).json({ error: 'Tabela não encontrada' })
    }

    try {
      if (priceTable.path && fs.existsSync(priceTable.path)) {
        fs.unlinkSync(priceTable.path)
      }
    } catch {
      // ignore
    }

    await prisma.priceTable.delete({ where: { id } })

    return res.status(204).send()
  } catch (error) {
    console.error('Delete price table error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router
