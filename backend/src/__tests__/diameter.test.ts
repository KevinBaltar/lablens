import { describe, it, expect } from 'vitest'
import { calculateDiameter, isValueInGrade, generateGradeValues } from '../utils/diameter'

describe('Diameter Calculator', () => {
  describe('calculateDiameter', () => {
    it('deve calcular o diâmetro corretamente', () => {
      // Fórmula: PA + AM + 4 - (DNP_menor × 2)
      const result = calculateDiameter(55, 10, 32, 34)
      // 55 + 10 + 4 - (32 × 2) = 69 - 64 = 5.0
      expect(result).toBe(5.0)
    })

    it('deve usar o menor DNP quando OD e OE são diferentes', () => {
      const result = calculateDiameter(55, 10, 30, 34)
      // DNP_menor = 30
      // 55 + 10 + 4 - (30 × 2) = 69 - 60 = 9.0
      expect(result).toBe(9.0)
    })

    it('deve arredondar para 1 casa decimal', () => {
      const result = calculateDiameter(55, 10, 31, 33)
      // DNP_menor = 31
      // 55 + 10 + 4 - (31 × 2) = 69 - 62 = 7.0
      expect(result).toBe(7.0)
    })
  })

  describe('isValueInGrade', () => {
    it('deve retornar true para valor dentro da grade', () => {
      expect(isValueInGrade(1.00, 0, 4, 0.25)).toBe(true)
      expect(isValueInGrade(1.25, 0, 4, 0.25)).toBe(true)
      expect(isValueInGrade(0, 0, 4, 0.25)).toBe(true)
      expect(isValueInGrade(4, 0, 4, 0.25)).toBe(true)
    })

    it('deve retornar false para valor fora da grade', () => {
      expect(isValueInGrade(-0.25, 0, 4, 0.25)).toBe(false)
      expect(isValueInGrade(4.25, 0, 4, 0.25)).toBe(false)
      expect(isValueInGrade(1.10, 0, 4, 0.25)).toBe(false)
    })

    it('deve retornar true para valores negativos na grade', () => {
      expect(isValueInGrade(-1.00, -4, 0, 0.25)).toBe(true)
      expect(isValueInGrade(-2.50, -4, 0, 0.25)).toBe(true)
    })
  })

  describe('generateGradeValues', () => {
    it('deve gerar valores corretos para grade positiva', () => {
      const values = generateGradeValues(0, 1, 0.25)
      expect(values).toEqual([0, 0.25, 0.50, 0.75, 1.00])
    })

    it('deve gerar valores corretos para grade negativa', () => {
      const values = generateGradeValues(-1, 0, 0.25)
      expect(values).toEqual([-1, -0.75, -0.50, -0.25, 0])
    })

    it('deve gerar valores com step de 0.50', () => {
      const values = generateGradeValues(0, 2, 0.50)
      expect(values).toEqual([0, 0.50, 1.00, 1.50, 2.00])
    })
  })
})
