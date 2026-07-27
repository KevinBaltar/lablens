import { describe, it, expect } from 'vitest'
import { hashPassword, comparePassword } from '../utils/password'

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('deve gerar hash da senha', async () => {
      const password = 'minhasenhasecreta'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50)
    })

    it('deve gerar hashes diferentes para a mesma senha', async () => {
      const password = 'mesmasenha'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('comparePassword', () => {
    it('deve retornar true para senha correta', async () => {
      const password = 'senha123'
      const hash = await hashPassword(password)

      const result = await comparePassword(password, hash)
      expect(result).toBe(true)
    })

    it('deve retornar false para senha incorreta', async () => {
      const password = 'senha123'
      const hash = await hashPassword(password)

      const result = await comparePassword('senhawrong', hash)
      expect(result).toBe(false)
    })
  })
})
