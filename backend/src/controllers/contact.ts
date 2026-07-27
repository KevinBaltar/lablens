import { Request, Response } from 'express'
import { prisma } from '../index'

export async function getContacts(req: Request, res: Response) {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { department: 'asc' },
    })

    return res.json(contacts)
  } catch (error) {
    console.error('Get contacts error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function createContact(req: Request, res: Response) {
  try {
    const { name, department, phone, email } = req.body

    const contact = await prisma.contact.create({
      data: { name, department, phone, email },
    })

    return res.status(201).json(contact)
  } catch (error) {
    console.error('Create contact error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function updateContact(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { name, department, phone, email } = req.body

    const contact = await prisma.contact.findUnique({
      where: { id },
    })

    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' })
    }

    const updated = await prisma.contact.update({
      where: { id },
      data: { name, department, phone, email },
    })

    return res.json(updated)
  } catch (error) {
    console.error('Update contact error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function deleteContact(req: Request, res: Response) {
  try {
    const { id } = req.params

    const contact = await prisma.contact.findUnique({
      where: { id },
    })

    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' })
    }

    await prisma.contact.delete({ where: { id } })

    return res.status(204).send()
  } catch (error) {
    console.error('Delete contact error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
