import { useState, useEffect, useMemo } from 'react'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { formatDateTime } from '../../lib/utils'

interface UserRow {
  id: string
  email: string
  name: string
  role: 'MASTER' | 'FILIAL'
  filialId: string | null
  createdAt: string
  filial?: { id: string; name: string } | null
}

interface FilialOption {
  id: string
  name: string
}

interface NewUserForm {
  email: string
  name: string
  password: string
  confirmPassword: string
  filialId: string
}

interface EditUserForm {
  email: string
  name: string
}

const PASSWORD_TIP = 'Mínimo de 12 caracteres'
const INITIAL_NEW: NewUserForm = {
  email: '',
  name: '',
  password: '',
  confirmPassword: '',
  filialId: '',
}

function validarNovaSenha(form: NewUserForm): string | null {
  if (!form.name.trim() || form.name.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email inválido'
  if (form.password.length < 12) return PASSWORD_TIP
  if (form.password !== form.confirmPassword) return 'As senhas não coincidem'
  if (!form.filialId) return 'Selecione uma Filial para o usuário'
  return null
}

function validarEdicao(form: EditUserForm): string | null {
  if (!form.name.trim() || form.name.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email inválido'
  return null
}

function gerarSenhaTemporaria(): string {
  const letrasMa = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const letrasMi = 'abcdefghijkmnopqrstuvwxyz'
  const nums = '23456789'
  const especiais = '!@#$%&*'
  const todos = letrasMa + letrasMi + nums + especiais
  let senha = ''
  senha += letrasMa[Math.floor(Math.random() * letrasMa.length)]
  senha += letrasMi[Math.floor(Math.random() * letrasMi.length)]
  senha += nums[Math.floor(Math.random() * nums.length)]
  senha += especiais[Math.floor(Math.random() * especiais.length)]
  for (let i = 0; i < 10; i++) {
    senha += todos[Math.floor(Math.random() * todos.length)]
  }
  return senha
}

export default function UserManagement() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserRow[]>([])
  const [filiais, setFiliais] = useState<FilialOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newForm, setNewForm] = useState<NewUserForm>(INITIAL_NEW)
  const [editForm, setEditForm] = useState<EditUserForm>({ email: '', name: '' })
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const usersFiltrados = useMemo(() => {
    const s = search.trim().toLowerCase()
    if (!s) return users
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.filial?.name?.toLowerCase().includes(s)
    )
  }, [users, search])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setIsLoading(true)
      const [usersResp, filiaisResp] = await Promise.all([
        api.get<UserRow[]>('/users'),
        api.get<FilialOption[]>('/filiais'),
      ])
      setUsers(usersResp.data)
      setFiliais(filiaisResp.data)
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      alert(error.response?.data?.error || 'Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }

  function openNewModal() {
    setNewForm({ ...INITIAL_NEW, password: gerarSenhaTemporaria(), confirmPassword: '' })
    setFormError(null)
    setTempPassword(null)
    setShowNewModal(true)
  }

  function handleGerarNovaSenha() {
    const pw = gerarSenhaTemporaria()
    setNewForm((f) => ({ ...f, password: pw, confirmPassword: pw }))
  }

  function handleCopiarSenha() {
    if (!newForm.password) return
    navigator.clipboard?.writeText(newForm.password).catch(() => {})
  }

  async function handleSubmitNew(e: React.FormEvent) {
    e.preventDefault()
    const erro = validarNovaSenha(newForm)
    if (erro) {
      setFormError(erro)
      return
    }
    setFormError(null)
    setIsSubmitting(true)
    try {
      const payload = {
        email: newForm.email.trim(),
        name: newForm.name.trim(),
        password: newForm.password,
        filialId: newForm.filialId,
      }
      const { data } = await api.post('/auth/register', payload)
      setTempPassword(newForm.password)
      setShowNewModal(false)
      setIsSubmitting(false)
      setShowPasswordModal(true)
      if (data?.user) {
        setUsers((prev) => {
          const userCompleto: UserRow = {
            ...data.user,
            createdAt: new Date().toISOString(),
            filial: filiais.find((f) => f.id === data.user.filialId) || null,
          }
          return [...prev, userCompleto].sort((a, b) => a.name.localeCompare(b.name))
        })
      } else {
        await loadData()
      }
    } catch (error: any) {
      console.error('Erro ao cadastrar usuário:', error)
      setFormError(error.response?.data?.error || 'Erro ao cadastrar usuário')
      setIsSubmitting(false)
    }
  }

  function openEditModal(u: UserRow) {
    setSelectedUser(u)
    setEditForm({ name: u.name, email: u.email })
    setFormError(null)
    setShowEditModal(true)
  }

  async function handleSubmitEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser) return
    const erro = validarEdicao(editForm)
    if (erro) {
      setFormError(erro)
      return
    }
    setFormError(null)
    setIsSubmitting(true)
    try {
      await api.put(`/users/${selectedUser.id}`, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
      })
      setShowEditModal(false)
      setIsSubmitting(false)
      await loadData()
    } catch (error: any) {
      console.error('Erro ao editar usuário:', error)
      setFormError(error.response?.data?.error || 'Erro ao editar usuário')
      setIsSubmitting(false)
    }
  }

  async function handleDelete(u: UserRow) {
    if (u.role === 'MASTER') {
      alert('Não é possível excluir um usuário Master.')
      return
    }
    const confirmMsg = `Tem certeza que deseja EXCLUIR o usuário "${u.name}"?\n\nEsta ação é irreversível e não pode ser desfeita se o usuário tiver pedidos.`
    if (!window.confirm(confirmMsg)) return
    try {
      await api.delete(`/users/${u.id}`)
      setUsers((prev) => prev.filter((x) => x.id !== u.id))
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error)
      alert(error.response?.data?.error || 'Erro ao excluir usuário')
    }
  }

  function fecharModalSenha() {
    setTempPassword(null)
    setShowPasswordModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gerenciar Usuários</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie os acessos das filiais à plataforma.
          </p>
        </div>
        <Button onClick={openNewModal} disabled={filiais.length === 0}>
          {filiais.length === 0 ? 'Cadastre uma Filial primeiro' : 'Novo Usuário'}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Pesquisar por nome, email ou filial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Perfil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadastrado em
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
              ) : usersFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {search
                      ? 'Nenhum usuário encontrado para a pesquisa.'
                      : 'Nenhum usuário cadastrado ainda.'}
                  </td>
                </tr>
              ) : (
                usersFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.role === 'MASTER'
                            ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                            : 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                        }`}
                      >
                        {u.role === 'MASTER' ? 'Matriz' : 'Filial'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {u.role === 'MASTER' ? (
                        <span className="text-gray-400 italic">—</span>
                      ) : (
                        u.filial?.name || <span className="text-red-500">Sem filial</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(u.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(u)}>
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={u.role === 'MASTER' || u.id === user?.id}
                          onClick={() => handleDelete(u)}
                          className={u.role === 'MASTER' || u.id === user?.id ? '' : 'text-red-600 hover:text-red-700'}
                          title={u.role === 'MASTER' ? 'Não é possível excluir usuário Master' : u.id === user?.id ? 'Você não pode se auto-excluir' : 'Excluir'}
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

      {/* Novo Usuário Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Novo Usuário de Filial</h3>
              </div>

              <form onSubmit={handleSubmitNew} className="space-y-4">
                <Input
                  label="Nome completo"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="Ex: João da Silva"
                  required
                />
                <Input
                  label="E-mail"
                  type="email"
                  value={newForm.email}
                  onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                  placeholder="joao@optica.com.br"
                  required
                />
                <Select
                  label="Filial (obrigatória)"
                  value={newForm.filialId}
                  onChange={(e) => setNewForm({ ...newForm, filialId: e.target.value })}
                  placeholder="Selecione a filial..."
                  options={filiais.map((f) => ({ value: f.id, label: f.name }))}
                  required
                />

                <div>
                  <div className="flex items-end justify-between mb-1 gap-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Senha temporária ({PASSWORD_TIP})
                    </label>
                    <div className="flex gap-2 pb-0.5">
                      <button
                        type="button"
                        onClick={handleCopiarSenha}
                        className="text-xs font-medium text-primary-600 hover:text-primary-700"
                      >
                        Copiar
                      </button>
                      <button
                        type="button"
                        onClick={handleGerarNovaSenha}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900"
                      >
                        Gerar outra
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newForm.password}
                      onChange={(e) => setNewForm({ ...newForm, password: e.target.value })}
                      placeholder="Senha segura de pelo menos 12 caracteres"
                      className="font-mono"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Recomendamos enviar esta senha ao usuário por um canal seguro e orientar a trocá-la no primeiro acesso.
                  </p>
                </div>

                <Input
                  label="Confirmar senha"
                  type="password"
                  value={newForm.confirmPassword}
                  onChange={(e) => setNewForm({ ...newForm, confirmPassword: e.target.value })}
                  placeholder="Digite novamente a senha"
                  required
                />

                {formError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {formError}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowNewModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Cadastrando...' : 'Cadastrar Usuário'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Editar Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Editar Usuário</h3>
              <p className="text-sm text-gray-500 mb-4">
                {selectedUser.role === 'MASTER' ? 'Usuário da Matriz' : `Vinculado à filial: ${selectedUser.filial?.name || '—'}`}
              </p>

              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <Input
                  label="Nome completo"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
                <Input
                  label="E-mail"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />

                <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600">
                  Para alterar a senha, solicite ao próprio usuário em <strong>Perfil → Alterar Senha</strong>, ou use a função "Esqueci minha senha" na tela de login.
                </div>

                {formError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {formError}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowEditModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação senha temporária */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Usuário cadastrado!</h3>
                  <p className="text-sm text-gray-500">Guarde a senha temporária abaixo.</p>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-3">
                <p className="text-xs font-medium text-amber-700 mb-1">Senha temporária</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="font-mono text-sm break-all text-amber-900">
                    {tempPassword}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => tempPassword && navigator.clipboard?.writeText(tempPassword).catch(() => {})}
                  >
                    Copiar
                  </Button>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-5">
                Envie esta senha para <strong>{newForm.email}</strong> e oriente o usuário a trocá-la no primeiro acesso (Perfil → Alterar Senha). Após fechar esta janela, a senha não poderá ser recuperada (apenas redefinida via esqueci-minha-senha).
              </p>

              <div className="flex justify-end">
                <Button onClick={fecharModalSenha}>Entendido, fechar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
