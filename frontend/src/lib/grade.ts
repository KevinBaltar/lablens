export function generateGradeValues(min: number, max: number, step: number): number[] {
  const values: number[] = []

  // Handle case where min > max (e.g., min=0, max=-4)
  // This means we need to go in descending order
  if (min > max) {
    let current = min
    while (current >= max - 0.001) {
      values.push(parseFloat(current.toFixed(2)))
      current -= step
    }
  } else {
    let current = min
    while (current <= max + 0.001) {
      values.push(parseFloat(current.toFixed(2)))
      current += step
    }
  }

  return values
}

export function formatGradeKey(esf: number, cil: number): string {
  return `${esf.toFixed(2)}_${cil.toFixed(2)}`
}

export function parseGradeKey(key: string): { esf: number; cil: number } {
  const [esf, cil] = key.split('_').map(Number)
  return { esf, cil }
}

export interface GradeData {
  [key: string]: number // "esf_cil" => quantity
}

export function getTotalFromGradeData(gradeData: GradeData): number {
  return Object.values(gradeData).reduce((sum, qty) => sum + qty, 0)
}
