import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { GradeData } from '../../lib/grade'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import GradeGrid from './GradeGrid'

interface Filial {
  id: string
  name: string
}

interface NewOrderProps {
  type: 'grade' | 'par-a-par' | 'surfacado'
  onComplete?: (orderOs: string) => void
}

interface Lens {
  id: string
  name: string
  type: string
  addition?: number
  grades: {
    id: string
    category: string
    esfericoMin: number
    esfericoMax: number
    cilindricoMin: number
    cilindricoMax: number
    step: number
  }[]
}

interface OrderFormData {
  lensId: string
  quantity: string
  clientOS: string
  patientName: string
  pedidoPor: string
  notes: string
  selectedGrade: string
  gradeData: GradeData
  // OD
  odEsf: string
  odCil: string
  odEixo: string
  odAdicao: string
  odCentroOptico: string
  odDnp: string
  // OE
  oeEsf: string
  oeCil: string
  oeEixo: string
  oeAdicao: string
  oeCentroOptico: string
  oeDnp: string
  // Surfaçado
  pa: string
  am: string
  vertical: string
}

const initialFormData: OrderFormData = {
  lensId: '',
  quantity: '1',
  clientOS: '',
  patientName: '',
  pedidoPor: '',
  notes: '',
  selectedGrade: '',
  gradeData: {},
  odEsf: '', odCil: '', odEixo: '', odAdicao: '', odCentroOptico: '', odDnp: '',
  oeEsf: '', oeCil: '', oeEixo: '', oeAdicao: '', oeCentroOptico: '', oeDnp: '',
  pa: '', am: '', vertical: '',
}

export default function NewOrder({ type, onComplete }: NewOrderProps) {
  const navigate = useNavigate()
  const { isMaster, user } = useAuth()
  const [lenses, setLenses] = useState<Lens[]>([])
  const [filials, setFilials] = useState<Filial[]>([])
  const [selectedLensId, setSelectedLensId] = useState('')
  const [selectedFilialId, setSelectedFilialId] = useState(user?.filialId || '')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<OrderFormData>(initialFormData)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [lensesRes, filialsRes] = await Promise.all([
        api.get('/lenses'),
        isMaster ? api.get('/filiais') : Promise.resolve({ data: [] }),
      ])
      setLenses(lensesRes.data)
      setFilials(filialsRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedLens = lenses.find((l) => l.id === selectedLensId)

  const filteredLenses = lenses.filter((lens) => {
    if (type === 'grade' || type === 'par-a-par') {
      return lens.type === 'VISAO_SIMPLES_PRONTA'
    }
    return lens.type !== 'VISAO_SIMPLES_PRONTA'
  })

  const updateField = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateDiameter = () => {
    const pa = parseFloat(formData.pa) || 0
    const am = parseFloat(formData.am) || 0
    const odDnp = parseFloat(formData.odDnp) || 0
    const oeDnp = parseFloat(formData.oeDnp) || 0
    const dnpMenor = Math.min(odDnp, oeDnp)

    if (pa === 0 || am === 0 || dnpMenor === 0) return '-'

    const diameter = pa + am + 4 - dnpMenor * 2
    return diameter.toFixed(1)
  }

  async function handleGradeSubmit(gradeData: GradeData, totalQuantity: number) {
    setError('')
    setIsSubmitting(true)

    try {
      const { data } = await api.post('/orders', {
        orderType: 'GRADE',
        lensId: selectedLensId,
        filialId: selectedFilialId || undefined,
        quantity: totalQuantity,
        gradeData,
        selectedGrade: selectedLens?.grades[0]?.id || '',
        clientOS: formData.clientOS || undefined,
        patientName: formData.patientName || undefined,
        pedidoPor: formData.pedidoPor || undefined,
        notes: formData.notes || undefined,
      })
      if (onComplete) {
        onComplete(data.os || 'N/A')
      } else {
        navigate('/dashboard/orders')
      }
    } catch (err: any) {
      const msg = err.response?.data?.error
        || err.response?.data?.errors?.map((e: any) => e.message).join(', ')
        || 'Erro ao enviar pedido'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmit() {
    setError('')
    setIsSubmitting(true)

    try {
      const orderTypeMap: Record<typeof type, string> = {
        'grade': 'GRADE',
        'par-a-par': 'PAR_A_PAR',
        'surfacado': 'SURFACADO',
      }

      if (type === 'surfacado' && (!formData.odDnp || !formData.oeDnp)) {
        setError('DNP é obrigatório para pedidos Surfaçados')
        setIsSubmitting(false)
        return
      }

      const payload = {
        orderType: orderTypeMap[type],
        lensId: selectedLensId,
        filialId: selectedFilialId || undefined,
        quantity: parseFloat(formData.quantity) || 1,
        clientOS: formData.clientOS || undefined,
        patientName: formData.patientName || undefined,
        pedidoPor: formData.pedidoPor || undefined,
        notes: formData.notes || undefined,
        selectedGrade: formData.selectedGrade || undefined,
        gradeData: type === 'grade' && Object.keys(formData.gradeData).length > 0 ? formData.gradeData : undefined,
        // OD
        odEsf: formData.odEsf ? parseFloat(formData.odEsf) : undefined,
        odCil: formData.odCil ? parseFloat(formData.odCil) : undefined,
        odEixo: formData.odEixo ? parseFloat(formData.odEixo) : undefined,
        odAdicao: formData.odAdicao ? parseFloat(formData.odAdicao) : undefined,
        odCentroOptico: formData.odCentroOptico ? parseFloat(formData.odCentroOptico) : undefined,
        odDnp: formData.odDnp ? parseFloat(formData.odDnp) : undefined,
        // OE
        oeEsf: formData.oeEsf ? parseFloat(formData.oeEsf) : undefined,
        oeCil: formData.oeCil ? parseFloat(formData.oeCil) : undefined,
        oeEixo: formData.oeEixo ? parseFloat(formData.oeEixo) : undefined,
        oeAdicao: formData.oeAdicao ? parseFloat(formData.oeAdicao) : undefined,
        oeCentroOptico: formData.oeCentroOptico ? parseFloat(formData.oeCentroOptico) : undefined,
        oeDnp: formData.oeDnp ? parseFloat(formData.oeDnp) : undefined,
        // Surfaçado
        pa: formData.pa ? parseFloat(formData.pa) : undefined,
        am: formData.am ? parseFloat(formData.am) : undefined,
        vertical: formData.vertical ? parseFloat(formData.vertical) : undefined,
      }

      const { data } = await api.post('/orders', payload)
      if (onComplete) {
        onComplete(data.os || 'N/A')
      } else {
        navigate('/dashboard/orders')
      }
    } catch (err: any) {
      const msg = err.response?.data?.error
        || err.response?.data?.errors?.map((e: any) => e.message).join(', ')
        || 'Erro ao enviar pedido'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filial selection (Master only) */}
      {isMaster && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Filial</h3>
          <Select
            label="Filial"
            value={selectedFilialId}
            onChange={(e) => setSelectedFilialId(e.target.value)}
            options={filials.map((filial) => ({
              value: filial.id,
              label: filial.name,
            }))}
            placeholder="Selecione uma filial"
          />
        </div>
      )}

      {/* Lens selection */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Lente</h3>
        <Select
          label="Lente"
          value={selectedLensId}
          onChange={(e) => {
            setSelectedLensId(e.target.value)
            updateField('lensId', e.target.value)
          }}
          options={filteredLenses.map((lens) => ({
            value: lens.id,
            label: `${lens.name} (${lens.type})`,
          }))}
          placeholder="Selecione uma lente"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Order form based on type */}
      {selectedLens && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          {type === 'grade' && (
            <GradeForm
              lens={selectedLens}
              formData={formData}
              updateField={updateField}
              onSubmit={handleGradeSubmit}
            />
          )}
          {type === 'par-a-par' && (
            <ParForm
              lens={selectedLens}
              formData={formData}
              updateField={updateField}
            />
          )}
          {type === 'surfacado' && (
            <SurfacadoForm
              lens={selectedLens}
              formData={formData}
              updateField={updateField}
              calculateDiameter={calculateDiameter}
            />
          )}

          {/* Submit buttons - hidden for grade (GradeGrid has its own) */}
          {type !== 'grade' && (
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate('/dashboard/orders')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedLensId || (isMaster && !selectedFilialId)}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
              </Button>
            </div>
          )}
        </div>
      )}

      {!selectedLens && !isLoading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          Selecione uma lente para continuar
        </div>
      )}
    </div>
  )
}

function GradeForm({
  lens,
  formData,
  updateField,
  onSubmit,
}: {
  lens: Lens
  formData: OrderFormData
  updateField: (field: keyof OrderFormData, value: string) => void
  onSubmit: (gradeData: GradeData, totalQuantity: number) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pedido em Grade</h3>
        <p className="text-gray-600 mb-4">
          Preencha a quantidade para cada combinação de dioptrias da lente: <strong>{lens.name}</strong>
        </p>
      </div>

      <GradeGrid
        lens={lens}
        onConfirm={onSubmit}
        onCancel={() => {}}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Input
          label="OS do Cliente"
          placeholder="Opcional"
          value={formData.clientOS}
          onChange={(e) => updateField('clientOS', e.target.value)}
        />
        <Input
          label="Nome do Paciente"
          placeholder="Opcional"
          value={formData.patientName}
          onChange={(e) => updateField('patientName', e.target.value)}
        />
        <Input
          label="Pedido por"
          placeholder="Opcional"
          value={formData.pedidoPor}
          onChange={(e) => updateField('pedidoPor', e.target.value)}
        />
      </div>
    </div>
  )
}

function ParForm({
  lens,
  formData,
  updateField,
}: {
  lens: Lens
  formData: OrderFormData
  updateField: (field: keyof OrderFormData, value: string) => void
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedido Par a Par</h3>
      <p className="text-gray-600 mb-6">
        Preencha os dados para cada olho para a lente: {lens.name}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Olho Direito */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Olho Direito (OD)</h4>
          <div className="space-y-4">
            <Input
              label="Esférico"
              placeholder="0.00"
              value={formData.odEsf}
              onChange={(e) => updateField('odEsf', e.target.value)}
            />
            <Input
              label="Cilíndrico"
              placeholder="0.00"
              value={formData.odCil}
              onChange={(e) => updateField('odCil', e.target.value)}
            />
            <Input
              label="Centro Óptico"
              placeholder="Opcional"
              value={formData.odCentroOptico}
              onChange={(e) => updateField('odCentroOptico', e.target.value)}
            />
            <Input
              label="DNP"
              placeholder="Opcional"
              value={formData.odDnp}
              onChange={(e) => updateField('odDnp', e.target.value)}
            />
          </div>
        </div>

        {/* Olho Esquerdo */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Olho Esquerdo (OE)</h4>
          <div className="space-y-4">
            <Input
              label="Esférico"
              placeholder="0.00"
              value={formData.oeEsf}
              onChange={(e) => updateField('oeEsf', e.target.value)}
            />
            <Input
              label="Cilíndrico"
              placeholder="0.00"
              value={formData.oeCil}
              onChange={(e) => updateField('oeCil', e.target.value)}
            />
            <Input
              label="Centro Óptico"
              placeholder="Opcional"
              value={formData.oeCentroOptico}
              onChange={(e) => updateField('oeCentroOptico', e.target.value)}
            />
            <Input
              label="DNP"
              placeholder="Opcional"
              value={formData.oeDnp}
              onChange={(e) => updateField('oeDnp', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          label="Quantidade"
          value={formData.quantity}
          onChange={(e) => updateField('quantity', e.target.value)}
          options={[
            { value: '1', label: '1 par' },
            { value: '0.5', label: '0,5 par' },
          ]}
        />
        <Input
          label="OS do Cliente"
          placeholder="Opcional"
          value={formData.clientOS}
          onChange={(e) => updateField('clientOS', e.target.value)}
        />
        <Input
          label="Nome do Paciente"
          placeholder="Opcional"
          value={formData.patientName}
          onChange={(e) => updateField('patientName', e.target.value)}
        />
        <Input
          label="Pedido por"
          placeholder="Opcional"
          value={formData.pedidoPor}
          onChange={(e) => updateField('pedidoPor', e.target.value)}
        />
      </div>
    </div>
  )
}

function SurfacadoForm({
  lens,
  formData,
  updateField,
  calculateDiameter,
}: {
  lens: Lens
  formData: OrderFormData
  updateField: (field: keyof OrderFormData, value: string) => void
  calculateDiameter: () => string
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedido Surfaçado</h3>
      <p className="text-gray-600 mb-6">
        Preencha os dados para cada olho e da armação para a lente: {lens.name}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Olho Direito */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Olho Direito (OD)</h4>
          <div className="space-y-4">
            <Input label="Esférico" placeholder="0.00" value={formData.odEsf} onChange={(e) => updateField('odEsf', e.target.value)} />
            <Input label="Cilíndrico" placeholder="0.00" value={formData.odCil} onChange={(e) => updateField('odCil', e.target.value)} />
            <Input label="Eixo" placeholder="0-180" value={formData.odEixo} onChange={(e) => updateField('odEixo', e.target.value)} />
            <Input label="Adição" placeholder="Opcional" value={formData.odAdicao} onChange={(e) => updateField('odAdicao', e.target.value)} />
            <Input label="Centro Óptico" placeholder="Opcional" value={formData.odCentroOptico} onChange={(e) => updateField('odCentroOptico', e.target.value)} />
            <Input label="DNP *" placeholder="Obrigatório" value={formData.odDnp} onChange={(e) => updateField('odDnp', e.target.value)} required />
          </div>
        </div>

        {/* Olho Esquerdo */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Olho Esquerdo (OE)</h4>
          <div className="space-y-4">
            <Input label="Esférico" placeholder="0.00" value={formData.oeEsf} onChange={(e) => updateField('oeEsf', e.target.value)} />
            <Input label="Cilíndrico" placeholder="0.00" value={formData.oeCil} onChange={(e) => updateField('oeCil', e.target.value)} />
            <Input label="Eixo" placeholder="0-180" value={formData.oeEixo} onChange={(e) => updateField('oeEixo', e.target.value)} />
            <Input label="Adição" placeholder="Opcional" value={formData.oeAdicao} onChange={(e) => updateField('oeAdicao', e.target.value)} />
            <Input label="Centro Óptico" placeholder="Opcional" value={formData.oeCentroOptico} onChange={(e) => updateField('oeCentroOptico', e.target.value)} />
            <Input label="DNP *" placeholder="Obrigatório" value={formData.oeDnp} onChange={(e) => updateField('oeDnp', e.target.value)} required />
          </div>
        </div>
      </div>

      {/* Dados da Armação */}
      <div className="mt-6 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">Dados da Armação</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input label="PA (Ponte + Aro)" placeholder="0.00" value={formData.pa} onChange={(e) => updateField('pa', e.target.value)} />
          <Input label="AM (Ângulo Maior)" placeholder="0.00" value={formData.am} onChange={(e) => updateField('am', e.target.value)} />
          <Input label="Vertical" placeholder="Informativo" value={formData.vertical} onChange={(e) => updateField('vertical', e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diâmetro</label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
              {calculateDiameter()}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          label="Quantidade"
          value={formData.quantity}
          onChange={(e) => updateField('quantity', e.target.value)}
          options={[
            { value: '1', label: '1 par' },
            { value: '0.5', label: '0,5 par' },
          ]}
        />
        <Input
          label="OS do Cliente"
          placeholder="Opcional"
          value={formData.clientOS}
          onChange={(e) => updateField('clientOS', e.target.value)}
        />
        <Input
          label="Nome do Paciente"
          placeholder="Opcional"
          value={formData.patientName}
          onChange={(e) => updateField('patientName', e.target.value)}
        />
        <Input
          label="Pedido por"
          placeholder="Opcional"
          value={formData.pedidoPor}
          onChange={(e) => updateField('pedidoPor', e.target.value)}
        />
      </div>
    </div>
  )
}
