import { useState } from 'react'
import { X } from 'lucide-react'

interface ContactModalProps {
  contact?: any
  onSave: (data: any) => void
  onClose: () => void
}

const OBCHODNICI = [
  { id: '1', name: 'Jan Novák' },
  { id: '2', name: 'Petr Svoboda' },
  { id: '3', name: 'Marie Kučerová' },
]

const CONTACT_TYPES = ['vedení', 'nákupčí', 'rozhodovatel', 'jiné']

export default function ContactModal({ contact, onSave, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState(
    contact || {
      name: '',
      company: '',
      email: '',
      phone: '',
      type: 'nákupčí',
      assignedTo: '1',
      notes: '',
    }
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.company || !formData.email) {
      alert('Vyplň povinná pole: Jméno, Společnost, Email')
      return
    }
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="glass rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {contact ? 'Editovat Kontakt' : 'Nový Kontakt'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jméno *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Jméno kontaktu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Společnost *</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Název společnosti"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="email@example.cz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="+420 123 456 789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Typ Kontaktu</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {CONTACT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Přiřazeno Obchodníkovi</label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {OBCHODNICI.map(ob => (
                <option key={ob.id} value={ob.id}>{ob.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poznámky</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Poznámky k tomuto kontaktu..."
            />
          </div>
        </form>

        <div className="flex gap-3 p-6 border-t border-gray-200 glass-sm">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-2xl text-gray-700 hover:glass-sm transition-colors"
          >
            Zrušit
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors font-medium"
          >
            {contact ? 'Aktualizovat' : 'Přidat'}
          </button>
        </div>
      </div>
    </div>
  )
}
