import { useState } from 'react'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function ChangePassword() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('As senhas não conferem')
      return
    }

    setIsSaving(true)

    try {
      await api.put(`/users/${user?.id}/password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })
      setMessage('Senha alterada com sucesso!')
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Erro ao alterar senha')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Alterar Senha</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('sucesso')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <Input
            label="Senha Atual"
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            required
          />

          <Input
            label="Nova Senha"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
          />

          <Input
            label="Confirmar Nova Senha"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />

          <div className="pt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Alterar Senha'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
