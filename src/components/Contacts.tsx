import { useState } from 'react'
import { Plus, Edit2, Trash2, Eye } from 'lucide-react'
import { useContactStore } from '../store/contactStore'
import { useProjectStore } from '../store/projectStore'
import ContactModal from './ContactModal'
import ContactHistoryModal from './ContactHistoryModal'
import toast from 'react-hot-toast'

interface ContactsProps {
  currentUser: any
}

const OBCHODNICI = [
  { id: '1', name: 'Jan Novák' },
  { id: '2', name: 'Petr Svoboda' },
  { id: '3', name: 'Marie Kučerová' },
]

export default function Contacts({ currentUser }: ContactsProps) {
  const { contacts, addContact, updateContact, deleteContact, getContactRevenue } = useContactStore()
  const { projects } = useProjectStore()
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState<any>(null)
  const [historyContact, setHistoryContact] = useState<any>(null)
  const [filterObchodnik, setFilterObchodnik] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredContacts = (filterObchodnik
    ? contacts.filter(c => c.assignedTo === filterObchodnik)
    : currentUser.role === 'admin'
    ? contacts
    : contacts.filter(c => c.assignedTo === currentUser.id)
  ).filter(c => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(query) ||
      c.company.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query) ||
      c.type.toLowerCase().includes(query) ||
      c.notes.toLowerCase().includes(query)
    )
  })

  const handleAddContact = () => {
    setEditingContact(null)
    setShowModal(true)
  }

  const handleEditContact = (contact: any) => {
    setEditingContact(contact)
    setShowModal(true)
  }

  const handleDeleteContact = (contactId: string) => {
    if (window.confirm('Opravdu chceš smazat tento kontakt?')) {
      deleteContact(contactId, currentUser.name)
      toast.success('Kontakt smazán')
    }
  }

  const handleSaveContact = (data: any) => {
    if (editingContact) {
      updateContact(editingContact.id, data, currentUser.name)
      toast.success('Kontakt aktualizován')
    } else {
      addContact(data, currentUser.name)
      toast.success('Kontakt přidán')
    }
    setShowModal(false)
  }

  const getObchodnikName = (id: string) => {
    return OBCHODNICI.find(o => o.id === id)?.name || id
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Adresář Kontaktů</h1>
            <p className="text-gray-600 mt-1">Spravuj obchodní partnery a jejich obraty</p>
          </div>
          <button
            onClick={handleAddContact}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nový Kontakt
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Hledat</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jméno, společnost, email, telefon..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtr podle Obchodníka</label>
              <select
                value={filterObchodnik}
                onChange={(e) => setFilterObchodnik(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Všichni obchodníci</option>
                {OBCHODNICI.map(ob => (
                  <option key={ob.id} value={ob.id}>{ob.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Statistika</label>
              <div className="text-lg font-semibold text-green-600">
                {filteredContacts.length} kontaktů
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Jméno</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Společnost</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Telefon</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Typ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Obchodník</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Obrat</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Akce</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map(contact => {
                  const revenue = getContactRevenue(contact.id, projects)
                  return (
                    <tr key={contact.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{contact.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{contact.company}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{contact.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{contact.phone}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {contact.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getObchodnikName(contact.assignedTo)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">
                        {(revenue / 1000000).toFixed(2)}M Kč
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setHistoryContact(contact)}
                            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Zobrazit historii"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditContact(contact)}
                            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Editovat"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => handleDeleteContact(contact.id)}
                              className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                              title="Smazat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredContacts.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Žádné kontakty k dispozici
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ContactModal
          contact={editingContact}
          onSave={handleSaveContact}
          onClose={() => setShowModal(false)}
        />
      )}

      {historyContact && (
        <ContactHistoryModal
          contact={historyContact}
          onClose={() => setHistoryContact(null)}
        />
      )}
    </div>
  )
}
