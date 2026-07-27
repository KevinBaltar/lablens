/**
 * Calcula o diâmetro da lente surfaçada
 * Fórmula: diâmetro = PA + AM + 4 - (DNP_menor × 2)
 * Onde DNP_menor = MIN(DNP_olho_direito, DNP_olho_esquerdo)
 */
export function calculateDiameter(
  pa: number,
  am: number,
  odDnp: number,
  oeDnp: number
): number {
  const dnpMenor = Math.min(odDnp, oeDnp)
  const diameter = pa + am + 4 - dnpMenor * 2
  return Math.round(diameter * 10) / 10 // 1 casa decimal
}

/**
 * Valida se um valor está dentro da grade da lente
 */
export function isValueInGrade(
  value: number,
  min: number,
  max: number,
  step: number = 0.25
): boolean {
  if (value < min || value > max) return false
  
  // Verificar se o valor está no passo correto
  const steps = Math.round((value - min) / step)
  const expectedValue = min + steps * step
  return Math.abs(value - expectedValue) < 0.001
}

/**
 * Gera os valores de uma grade
 */
export function generateGradeValues(
  min: number,
  max: number,
  step: number = 0.25
): number[] {
  const values: number[] = []

  // Handle case where min > max (e.g., min=0, max=-4)
  if (min > max) {
    for (let value = min; value >= max - 0.001; value -= step) {
      values.push(Math.round(value * 100) / 100)
    }
  } else {
    for (let value = min; value <= max + 0.001; value += step) {
      values.push(Math.round(value * 100) / 100)
    }
  }

  return values
}
