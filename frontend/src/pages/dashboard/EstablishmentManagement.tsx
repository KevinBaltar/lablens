import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

interface Establishment {
  id: string
  name: string
  type: string
  cnpj: string | null
  address: string
  city: string
  state: string
  zipCode: string | null
  phone: string | null
  email: string | null
  responsible: string | null
  notes: string | null
  active: boolean
  createdAt: string
  filial: {
    id: string
    name: string
  }
}

const establishmentTypes = [
  { value: 'LABORATORIO', label: 'Laboratório' },
  { value: 'FILIAL', label: 'Filial' },
  { value: 'DEPOSITO', label: 'Depósito' },
  { value: 'OUTROS', label: 'Outros' },
]

const brazilianStates = [
  { value: 'AC', label: 'AC' },
  { value: 'AL', label: 'AL' },
  { value: 'AP', label: 'AP' },
  { value: 'AM', label: 'AM' },
  { value: 'BA', label: 'BA' },
  { value: 'CE', label: 'CE' },
  { value: 'DF', label: 'DF' },
  { value: 'ES', label: 'ES' },
  { value: 'GO', label: 'GO' },
  { value: 'MA', label: 'MA' },
  { value: 'MT', label: 'MT' },
  { value: 'MS', label: 'MS' },
  { value: 'MG', label: 'MG' },
  { value: 'PA', label: 'PA' },
  { value: 'PB', label: 'PB' },
  { value: 'PR', label: 'PR' },
  { value: 'PE', label: 'PE' },
  { value: 'PI', label: 'PI' },
  { value: 'RJ', label: 'RJ' },
  { value: 'RN', label: 'RN' },
  { value: 'RS', label: 'RS' },
  { value: 'RO', label: 'RO' },
  { value: 'RR', label: 'RR' },
  { value: 'SC', label: 'SC' },
  { value: 'SP', label: 'SP' },
  { value: 'SE', label: 'SE' },
  { value: 'TO', label: 'TO' },
]

const typeColors = {
  LABORATORIO: 'bg-blue-100 text-blue-800',
  FILIAL: 'bg-green-100 text-green-800',
  DEPOSITO: 'bg-yellow-100 text-yellow-800',
  OUTROS: 'bg-gray-100 text-gray-800',
}

export default function EstablishmentManagement() {
  const { isMaster } = useAuth()
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [filiais, setFiliais] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEstablishment, setEditingEstablishment] = useState<Establishment | null>(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [selectedFilialId, setSelectedFilialId] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    type: 'LABORATORIO',
    cnpj: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    responsible: '',
    notes: '',
  })

  useEffect(() => {
    loadEstablishments()
    if (isMaster) {
      loadFiliais()
    }
  }, [])

  async function loadEstablishments() {
    try {
      const params: any = {}
      if (search) params.search = search
      if (filterType) params.type = filterType
      if (filterActive) params.active = filterActive
      if (selectedFilialId) params.filialId = selectedFilialId

      const { data } = await api.get('/establishments', { params })
      setEstablishments(data)
    } catch (error) {
      console.error('Error loading establishments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadFiliais() {
    try {
      const { data } = await api.get('/filiais')
      setFiliais(data.map((f: any) => ({ id: f.id, name: f.name })))
    } catch (error) {
      console.error('Error loading filiais:', error)
    }
  }

  function handleNew() {
    setEditingEstablishment(null)
    setFormData({
      name: '',
      type: 'LABORATORIO',
      cnpj: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      responsible: '',
      notes: '',
    })
    setShowForm(true)
  }

  function handleEdit(establishment: Establishment) {
    setEditingEstablishment(establishment)
    setFormData({
      name: establishment.name,
      type: establishment.type,
      cnpj: establishment.cnpj || '',
      address: establishment.address,
      city: establishment.city,
      state: establishment.state,
      zipCode: establishment.zipCode || '',
      phone: establishment.phone || '',
      email: establishment.email || '',
      responsible: establishment.responsible || '',
      notes: establishment.notes || '',
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      ...formData,
      cnpj: formData.cnpj || undefined,
      zipCode: formData.zipCode || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      responsible: formData.responsible || undefined,
      notes: formData.notes || undefined,
    }

    try {
      if (editingEstablishment) {
        await api.put(`/establishments/${editingEstablishment.id}`, payload)
      } else {
        await api.post('/establishments', payload)
      }
      setShowForm(false)
      await loadEstablishments()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar estabelecimento')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este estabelecimento?')) return

    try {
      await api.delete(`/establishments/${id}`)
      await loadEstablishments()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao excluir estabelecimento')
    }
  }

  async function handleToggleStatus(id: string) {
    try {
      await api.patch(`/establishments/${id}/toggle-status`)
      await loadEstablishments()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao alterar status')
    }
  }

  function formatCnpj(value: string) {
    const numbers = value.replace(/\D/g, '').slice(0, 14)
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  function formatCep(value: string) {
    const numbers = value.replace(/\D/g, '').slice(0, 8)
    return numbers.replace(/(\d{5})(\d)/, '$1-$2')
  }

  function formatPhone(value: string) {
    const numbers = value.replace(/\D/g, '').slice(0, 11)
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1')
    }
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Cadastro de Estabelecimentos</h2>
        <Button onClick={handleNew}>Novo Estabelecimento</Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {isMaster && (
            <Select
              label="Filial"
              value={selectedFilialId}
              onChange={(e) => {
                setSelectedFilialId(e.target.value)
                loadEstablishments()
              }}
              options={filiais.map((f) => ({ value: f.id, label: f.name }))}
              placeholder="Todas as filiais"
            />
          )}
          <Select
            label="Tipo"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value)
              loadEstablishments()
            }}
            options={establishmentTypes}
            placeholder="Todos"
          />
          <Select
            label="Status"
            value={filterActive}
            onChange={(e) => {
              setFilterActive(e.target.value)
              loadEstablishments()
            }}
            options={[
              { value: 'true', label: 'Ativo' },
              { value: 'false', label: 'Inativo' },
            ]}
            placeholder="Todos"
          />
          <Input
            label="Buscar"
            placeholder="Nome, CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-end">
            <Button onClick={loadEstablishments} variant="secondary">
              Buscar
            </Button>
          </div>
        </div>
      </div>

      {/* Establishments List */}
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
                  CNPJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endereço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                {isMaster && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filial
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={isMaster ? 8 : 7} className="px-6 py-12 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : establishments.length === 0 ? (
                <tr>
                  <td colSpan={isMaster ? 8 : 7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum estabelecimento encontrado
                  </td>
                </tr>
              ) : (
                establishments.map((establishment) => (
                  <tr key={establishment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {establishment.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[establishment.type as keyof typeof typeColors]}`}>
                        {establishmentTypes.find((t) => t.value === establishment.type)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {establishment.cnpj || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {establishment.address}, {establishment.city}/{establishment.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {establishment.responsible || '-'}
                    </td>
                    {isMaster && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {establishment.filial?.name || '-'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(establishment.id)}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          establishment.active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {establishment.active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(establishment)}>
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(establishment.id)}
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
                {editingEstablishment ? 'Editar Estabelecimento' : 'Novo Estabelecimento'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nome *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Select
                    label="Tipo *"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    options={establishmentTypes}
                  />
                </div>

                <Input
                  label="CNPJ"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: formatCnpj(e.target.value) })}
                  placeholder="00.000.000/0000-00"
                />

                <Input
                  label="Endereço *"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />

                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Cidade *"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                  <Select
                    label="Estado *"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    options={brazilianStates}
                    placeholder="UF"
                  />
                  <Input
                    label="CEP"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: formatCep(e.target.value) })}
                    placeholder="00000-000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Telefone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                    placeholder="(00) 00000-0000"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <Input
                  label="Responsável"
                  value={formData.responsible}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingEstablishment ? 'Salvar' : 'Criar'}
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
