import { useState, useMemo } from 'react'
import { generateGradeValues, formatGradeKey, GradeData, getTotalFromGradeData } from '../../lib/grade'
import Button from '../../components/ui/Button'

interface LensGrade {
  id: string
  category: string
  esfericoMin: number
  esfericoMax: number
  cilindricoMin: number
  cilindricoMax: number
  step: number
}

interface Lens {
  id: string
  name: string
  type: string
  grades: LensGrade[]
}

interface GradeGridProps {
  lens: Lens
  onConfirm: (gradeData: GradeData, totalQuantity: number) => void
  onCancel: () => void
}

export default function GradeGrid({ lens, onConfirm, onCancel }: GradeGridProps) {
  const [activeGradeIndex, setActiveGradeIndex] = useState(0)
  const [quantities, setQuantities] = useState<GradeData>({})
  const [focusedCell, setFocusedCell] = useState<string | null>(null)

  const activeGrade = lens.grades[activeGradeIndex]

  const esfericoValues = useMemo(() => {
    if (!activeGrade) return []
    return generateGradeValues(
      activeGrade.esfericoMin,
      activeGrade.esfericoMax,
      activeGrade.step
    )
  }, [activeGrade])

  const cilindricoValues = useMemo(() => {
    if (!activeGrade) return []
    return generateGradeValues(
      activeGrade.cilindricoMin,
      activeGrade.cilindricoMax,
      activeGrade.step
    )
  }, [activeGrade])

  const totalPieces = useMemo(() => {
    return getTotalFromGradeData(quantities)
  }, [quantities])

  function updateQuantity(esf: number, cil: number, value: string) {
    const key = formatGradeKey(esf, cil)
    const numValue = parseInt(value) || 0

    setQuantities(prev => {
      const next = { ...prev }
      if (numValue > 0) {
        next[key] = numValue
      } else {
        delete next[key]
      }
      return next
    })
  }

  function handleClear() {
    setQuantities({})
  }

  function handleConfirm() {
    if (totalPieces === 0) {
      alert('Preencha ao menos uma quantidade na grade')
      return
    }
    onConfirm(quantities, totalPieces)
  }

  if (!activeGrade) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma grade configurada para esta lente
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Grade Tabs */}
      {lens.grades.length > 1 && (
        <div className="flex gap-2">
          {lens.grades.map((grade, index) => (
            <button
              key={grade.id}
              onClick={() => setActiveGradeIndex(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                index === activeGradeIndex
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {grade.category === 'NEGATIVA' ? 'GRADE NEGATIVA (-/-)' : 'GRADE POSITIVA (+/+)'}
            </button>
          ))}
        </div>
      )}

      {/* Single grade label */}
      {lens.grades.length === 1 && (
        <div className="text-sm font-medium text-gray-700">
          {activeGrade.category === 'NEGATIVA' ? 'GRADE NEGATIVA (-/-)' : 'GRADE POSITIVA (+/+)'}
        </div>
      )}

      {/* Grid Table */}
      <div className="overflow-auto max-h-[500px] border border-gray-200 rounded-lg">
        <table className="border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {/* Corner cell - Labels */}
              <th
                className="bg-gray-100 border border-gray-300 text-[10px] font-medium text-gray-500 whitespace-nowrap"
                style={{ width: '65px' }}
              >
                <div className="flex flex-col leading-tight">
                  <span className="text-gray-400">CIL →</span>
                  <span className="font-semibold mt-2">ESF ↓</span>
                </div>
              </th>
              {/* Column headers - Cilíndrico values */}
              {cilindricoValues.map(cil => {
                const isFocusedCol = focusedCell && focusedCell.endsWith(`_${cil.toFixed(2)}`)
                return (
                  <th
                    key={cil}
                    className={`border border-gray-300 px-2 py-2 text-xs font-medium min-w-[60px] text-center transition-colors ${
                      isFocusedCol ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {cil.toFixed(2)}
                    {/* Blue indicator bar */}
                    <div
                      className={`w-full h-1 rounded mt-1 ${
                        isFocusedCol ? 'bg-primary-500' : 'bg-transparent'
                      }`}
                    />
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {esfericoValues.map(esf => {
              const isFocusedRow = focusedCell && focusedCell.startsWith(`${esf.toFixed(2)}_`)
              return (
              <tr key={esf}>
                {/* Row header - Esférico value */}
                <td
                  className={`border border-gray-300 px-3 py-2 text-xs font-medium text-right ${
                    isFocusedRow ? 'bg-primary-50 text-primary-700' : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  {esf.toFixed(2)}
                </td>
                {cilindricoValues.map(cil => {
                  const key = formatGradeKey(esf, cil)
                  const isFocused = focusedCell === key
                  const hasValue = quantities[key] && quantities[key] > 0

                  return (
                    <td
                      key={cil}
                      className={`border border-gray-300 p-0.5 ${
                        isFocused
                          ? 'bg-primary-50 ring-2 ring-primary-500'
                          : hasValue
                          ? 'bg-green-50'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={quantities[key] || ''}
                        onChange={(e) => updateQuantity(esf, cil, e.target.value)}
                        onFocus={() => setFocusedCell(key)}
                        onBlur={() => setFocusedCell(null)}
                        className="w-full h-8 text-center text-xs border-0 bg-transparent focus:outline-none"
                        placeholder=""
                      />
                    </td>
                  )
                })}
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Summary and Actions */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            Total de peças: <span className="font-bold text-gray-900">{totalPieces}</span>
          </p>
          <p className="text-xs text-gray-500">
            Preencha a quantidade para cada combinação desejada
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleClear}>
            Limpar
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={totalPieces === 0}>
            Enviar Pedido ({totalPieces} peças)
          </Button>
        </div>
      </div>
    </div>
  )
}
