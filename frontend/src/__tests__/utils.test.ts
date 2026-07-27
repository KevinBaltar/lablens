import { describe, it, expect } from 'vitest'
import { cn, formatCurrency, formatDate, formatDateTime } from '../lib/utils'

describe('Utils', () => {
  describe('cn', () => {
    it('deve concatenar classes CSS', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('deve lidar com classes condicionais', () => {
      const result = cn('base', false && 'hidden', 'extra')
      expect(result).toBe('base extra')
    })

    it('deve mesclar classes duplicadas', () => {
      const result = cn('p-4', 'p-8')
      expect(result).toBe('p-8')
    })
  })

  describe('formatCurrency', () => {
    it('deve formatar valor como moeda brasileira', () => {
      const result = formatCurrency(1234.56)
      expect(result).toContain('1.234,56')
    })

    it('deve formatar valor zero', () => {
      const result = formatCurrency(0)
      expect(result).toContain('0,00')
    })
  })

  describe('formatDate', () => {
    it('deve formatar data no padrão brasileiro', () => {
      const date = new Date('2024-01-15')
      const result = formatDate(date)
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })

    it('deve aceitar string de data', () => {
      const result = formatDate('2024-01-15')
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })
  })

  describe('formatDateTime', () => {
    it('deve formatar data e hora', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = formatDateTime(date)
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })
  })
})
