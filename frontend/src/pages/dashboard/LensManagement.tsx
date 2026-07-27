import { useState, useEffect } from 'react'
import api from '../../lib/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

interface Lens {
  id: string
  name: string
  type: string
  addition: number | null
  grades: {
    id: string
    category: string
    esfericoMin: number
    esfericoMax: number
    cilindricoMin: number
    cilindricoMax: number
    step: number
  }[]
  _count: {
    orders: number
  }
}

const lensTypes = [
  { value: 'VISAO_SIMPLES_PRONTA', label: 'Visão Simples Pronta' },
  { value: 'VISAO_SIMPLES_SURFACADA', label: 'Visão Simples Surfaçada' },
  { value: 'PROGRESSIVA', label: 'Progressiva' },
  { value: 'BIFOCAL', label: 'Bifocal' },
]

export default function LensManagement() {
  const [lenses, setLenses] = useState<Lens[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLens, setEditingLens] = useState<Lens | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'VISAO_SIMPLES_PRONTA',
    addition: '',
    grades: [
      { category: 'POSITIVA', esfericoMin: 0, esfericoMax: 4, cilindricoMin: 0, cilindricoMax: -4 },
    ],
  })

  useEffect(() => {
    loadLenses()
  }, [])

  async function loadLenses() {
    try {
      const { data } = await api.get('/lenses')
      setLenses(data)
    } catch (error) {
      console.error('Error loading lenses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleNew() {
    setEditingLens(null)
    setFormData({
      name: '',
      type: 'VISAO_SIMPLES_PRONTA',
      addition: '',
      grades: [
        { category: 'POSITIVA', esfericoMin: 0, esfericoMax: 4, cilindricoMin: 0, cilindricoMax: -4 },
      ],
    })
    setShowForm(true)
  }

  function handleEdit(lens: Lens) {
    setEditingLens(lens)
    setFormData({
      name: lens.name,
      type: lens.type,
      addition: lens.addition?.toString() || '',
      grades: lens.grades.map((g) => ({
        category: g.category,
        esfericoMin: g.esfericoMin,
        esfericoMax: g.esfericoMax,
        cilindricoMin: g.cilindricoMin,
        cilindricoMax: g.cilindricoMax,
      })),
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      name: formData.name,
      type: formData.type,
      addition: formData.addition ? parseFloat(formData.addition) : undefined,
      grades: formData.grades,
    }

    try {
      if (editingLens) {
        await api.put(`/lenses/${editingLens.id}`, payload)
      } else {
        await api.post('/lenses', payload)
      }
      setShowForm(false)
      await loadLenses()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar lente')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta lente?')) return

    try {
      await api.delete(`/lenses/${id}`)
      await loadLenses()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao excluir lente')
    }
  }

  function addGrade() {
    setFormData({
      ...formData,
      grades: [
        ...formData.grades,
        { category: 'POSITIVA', esfericoMin: 0, esfericoMax: 4, cilindricoMin: 0, cilindricoMax: -4 },
      ],
    })
  }

  function removeGrade(index: number) {
    setFormData({
      ...formData,
      grades: formData.grades.filter((_, i) => i !== index),
    })
  }

  function updateGrade(index: number, field: string, value: number | string) {
    const newGrades = [...formData.grades]
    newGrades[index] = { ...newGrades[index], [field]: value }
    setFormData({ ...formData, grades: newGrades })
  }

  const needsAddition = formData.type === 'PROGRESSIVA' || formData.type === 'BIFOCAL'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Cadastro de Lentes</h2>
        <Button onClick={handleNew}>Nova Lente</Button>
      </div>

      {/* Lens List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : lenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Nenhuma lente cadastrada
                  </td>
                </tr>
              ) : (
                lenses.map((lens) => (
                  <tr key={lens.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {lens.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lensTypes.find((t) => t.value === lens.type)?.label || lens.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lens.addition ?? '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lens.grades.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lens._count.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(lens)}>
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(lens.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingLens ? 'Editar Lente' : 'Nova Lente'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <Select
                  label="Tipo"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  options={lensTypes}
                />

                {needsAddition && (
                  <Input
                    label="Adição"
                    type="number"
                    step="0.25"
                    value={formData.addition}
                    onChange={(e) => setFormData({ ...formData, addition: e.target.value })}
                    required
                  />
                )}

                {/* Grades */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Grades</label>
                    <Button type="button" variant="ghost" size="sm" onClick={addGrade}>
                      + Adicionar Grade
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.grades.map((grade, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Select
                            value={grade.category}
                            onChange={(e) => updateGrade(index, 'category', e.target.value)}
                            options={[
                              { value: 'POSITIVA', label: 'Positiva' },
                              { value: 'NEGATIVA', label: 'Negativa' },
                            ]}
                          />
                          {formData.grades.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeGrade(index)}
                              className="text-red-600"
                            >
                              Remover
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Esférico Mín"
                            type="number"
                            step="0.25"
                            value={grade.esfericoMin}
                            onChange={(e) => updateGrade(index, 'esfericoMin', parseFloat(e.target.value))}
                          />
                          <Input
                            label="Esférico Máx"
                            type="number"
                            step="0.25"
                            value={grade.esfericoMax}
                            onChange={(e) => updateGrade(index, 'esfericoMax', parseFloat(e.target.value))}
                          />
                          <Input
                            label="Cilíndrico Mín"
                            type="number"
                            step="0.25"
                            value={grade.cilindricoMin}
                            onChange={(e) => updateGrade(index, 'cilindricoMin', parseFloat(e.target.value))}
                          />
                          <Input
                            label="Cilíndrico Máx"
                            type="number"
                            step="0.25"
                            value={grade.cilindricoMax}
                            onChange={(e) => updateGrade(index, 'cilindricoMax', parseFloat(e.target.value))}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingLens ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
