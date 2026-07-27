import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate } from '../../lib/utils'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

interface Order {
  id: string
  os: string | null
  clientOS: string | null
  status: 'PENDENTE' | 'ACEITO' | 'RECUSADO' | 'CANCELADO'
  orderType: string
  quantity: number
  patientName: string | null
  selectedGrade: string | null
  createdAt: string
  lens: {
    name: string
    type: string
  }
  filial: {
    id: string
    name: string
  }
}

interface OrderListProps {
  onSelectOrder?: (orderId: string) => void
}

const statusColors = {
  PENDENTE: 'bg-yellow-500',
  ACEITO: 'bg-green-500',
  RECUSADO: 'bg-red-500',
  CANCELADO: 'bg-gray-500',
}

const statusLabels = {
  PENDENTE: 'Pendente',
  ACEITO: 'Aceito',
  RECUSADO: 'Recusado',
  CANCELADO: 'Cancelado',
}

export default function OrderList({ onSelectOrder }: OrderListProps) {
  const { isMaster } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [filiais, setFiliais] = useState<{ id: string; name: string }[]>([])
  const [selectedFilialId, setSelectedFilialId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    loadOrders()
    if (isMaster) {
      loadFiliais()
    }
  }, [])

  async function loadOrders(filialId?: string) {
    try {
      const params: any = {}
      if (filialId) params.filialId = filialId
      if (filters.status) params.status = filters.status
      if (filters.search) params.search = filters.search

      const { data } = await api.get('/orders', { params })
      setOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
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

  function handleFilialChange(filialId: string) {
    setSelectedFilialId(filialId)
    loadOrders(filialId || undefined)
  }

  const filteredOrders = orders.filter((order) => {
    if (filters.search && !order.os?.includes(filters.search) && !order.clientOS?.includes(filters.search) && !order.patientName?.includes(filters.search)) {
      return false
    }
    if (filters.status && order.status !== filters.status) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {isMaster && (
            <Select
              label="Filial"
              value={selectedFilialId}
              onChange={(e) => handleFilialChange(e.target.value)}
              options={filiais.map((f) => ({ value: f.id, label: f.name }))}
              placeholder="Todas as filiais"
            />
          )}
          <Input
            label="Buscar"
            placeholder="Nº Pedido, OS Cliente, Lente..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={[
              { value: 'PENDENTE', label: 'Pendente' },
              { value: 'ACEITO', label: 'Aceito' },
              { value: 'RECUSADO', label: 'Recusado' },
              { value: 'CANCELADO', label: 'Cancelado' },
            ]}
            placeholder="Todos"
          />
          <Input
            label="Data Início"
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <Input
            label="Data Fim"
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nº Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OS Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lente
                </th>
                {isMaster && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filial
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qtd
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={isMaster ? 9 : 8} className="px-6 py-12 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={isMaster ? 9 : 8} className="px-6 py-12 text-center text-gray-500">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${statusColors[order.status]}`} />
                        <span className="text-sm text-gray-900">{statusLabels[order.status]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.os || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.clientOS || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.lens?.name || '-'}
                    </td>
                    {isMaster && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.filial?.name || '-'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.orderType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectOrder?.(order.id)}
                      >
                        Ver detalhes
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
