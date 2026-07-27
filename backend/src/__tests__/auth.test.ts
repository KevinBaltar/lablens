import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app, { prisma } from '../index'
import { hashPassword } from '../utils/password'

describe('Auth API', () => {
  const testUser = {
    email: 'test@lablens.com.br',
    name: 'Usuário Teste',
    password: 'teste-seguro-123',
  }

  beforeEach(async () => {
    const hashedPassword = await hashPassword(testUser.password)
    await prisma.user.create({
      data: { ...testUser, password: hashedPassword, role: 'MASTER' },
    })
  })

  async function authenticatedMaster() {
    const agent = request.agent(app)
    const response = await agent.post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    })
    expect(response.status).toBe(200)
    return agent
  }

  describe('POST /api/auth/login', () => {
    it('sets an httpOnly session cookie with valid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      })

      expect(response.status).toBe(200)
      expect(response.body).not.toHaveProperty('token')
      expect(response.body.user.email).toBe(testUser.email)
      expect(String(response.headers['set-cookie'])).toContain('HttpOnly')
    })

    it('rejects invalid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'senha-incorreta-123',
      })

      expect(response.status).toBe(401)
    })

    it('does not reveal whether an email exists', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'naoexiste@lablens.com.br',
        password: 'senha-incorreta-123',
      })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Credenciais inválidas')
    })
  })

  describe('POST /api/auth/register', () => {
    it('requires authentication and master authorization', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'novo@lablens.com.br', name: 'Novo Usuário', password: 'senha-segura-123', filialId: 'x',
      })

      expect(response.status).toBe(401)
    })

    it('allows a master to provision a filial user', async () => {
      const filial = await prisma.filial.create({
        data: { cnpj: '12.345.678/0001-90', name: 'Filial Teste', address: 'Rua Teste, 1', contact: 'Contato', email: 'filial@test.com', phone: '11999999999' },
      })
      const agent = await authenticatedMaster()

      const response = await agent.post('/api/auth/register').send({
        email: 'novo@lablens.com.br', name: 'Novo Usuário', password: 'senha-segura-123', filialId: filial.id,
      })

      expect(response.status).toBe(201)
      expect(response.body).not.toHaveProperty('token')
      expect(response.body.user.role).toBe('FILIAL')
    })
  })

  describe('GET /api/auth/profile', () => {
    it('returns the profile through the session cookie', async () => {
      const agent = await authenticatedMaster()
      const response = await agent.get('/api/auth/profile')

      expect(response.status).toBe(200)
      expect(response.body.email).toBe(testUser.email)
    })

    it('rejects requests without a session', async () => {
      const response = await request(app).get('/api/auth/profile')

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Não autenticado')
    })
  })
})
