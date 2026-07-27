import { useState, useEffect } from 'react'
import api from '../../lib/api'

interface Contact {
  id: string
  name: string
  department: string
  phone: string
  email: string | null
}

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadContacts()
  }, [])

  async function loadContacts() {
    try {
      const { data } = await api.get('/contacts')
      setContacts(data)
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const departments = [...new Set(contacts.map((c) => c.department))]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Contatos Internos</h3>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nenhum contato cadastrado</div>
        ) : (
          <div className="space-y-6">
            {departments.map((dept) => (
              <div key={dept}>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {dept}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contacts
                    .filter((c) => c.department === dept)
                    .map((contact) => (
                      <div
                        key={contact.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{contact.phone}</p>
                        {contact.email && (
                          <p className="text-sm text-primary-600 mt-1">{contact.email}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
