import { useState } from 'react'
import { X } from 'lucide-react'
import { useProjectStore, type ProjectStatus } from '../store/projectStore'
import toast from 'react-hot-toast'

interface ProjectModalProps {
  project: any
  onClose: () => void
  user: any
}

const USERS = [
  { id: '1', name: 'Jan Novák' },
  { id: '2', name: 'Petr Svoboda' },
  { id: '3', name: 'Marie Kučerová' },
]

const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'leads', label: 'Příležitosti' },
  { value: 'prep', label: 'Příprava' },
  { value: 'purchase', label: 'Nákup' },
  { value: 'execution', label: 'Realizace' },
  { value: 'revision', label: 'Revize' },
  { value: 'distribution', label: 'Distribuce' },
  { value: 'service', label: 'Servis' },
]

const FormField = ({ label, required, children }: any) => (
  <div>
    <label className="block text-base font-bold text-gray-900 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
)

export default function ProjectModal({ project, onClose, user }: ProjectModalProps) {
  const { addProject, updateProject } = useProjectStore()
  const [formData, setFormData] = useState(
    project || {
      name: '',
      customer: '',
      status: 'leads' as ProjectStatus,
      assignedTo: user.role === 'admin' ? '1' : user.id,
      power: 0,
      cost: 0,
      revenue: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.customer) {
      toast.error('Vyplň název a zákazníka')
      return
    }

    if (project) {
      updateProject(project.id, formData)
      toast.success('Projekt aktualizován')
    } else {
      addProject({
        ...formData,
        id: Date.now().toString(),
        phases: {},
        documents: [],
        createdAt: new Date().toISOString(),
      })
      toast.success('Projekt vytvořen')
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200 px-8 py-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">
            {project ? '✏️ Editovat projekt' : '➕ Nový projekt'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-blue-200 rounded-lg transition-colors">
            <X className="w-7 h-7 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Řada 1: Název, Zákazník, Status */}
          <div className="grid grid-cols-3 gap-6">
            <FormField label="Název projektu" required>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Např. Panely na střechu"
              />
            </FormField>

            <FormField label="Zákazník" required>
              <input
                type="text"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Jméno zákazníka"
              />
            </FormField>

            <FormField label="Status">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Řada 2: Obchodník, Výkon, Status */}
          <div className="grid grid-cols-3 gap-6">
            {user.role === 'admin' && (
              <FormField label="Přiřazeno">
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {USERS.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </FormField>
            )}

            <FormField label="Výkon (kWp)">
              <input
                type="number"
                value={formData.power}
                onChange={(e) => setFormData({ ...formData, power: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10"
              />
            </FormField>

            <FormField label="Výnos (Kč)">
              <input
                type="number"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="350000"
              />
            </FormField>
          </div>

          {/* Řada 3: Náklady, Počáteční datum, Termín */}
          <div className="grid grid-cols-3 gap-6">
            <FormField label="Náklady (Kč)">
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="250000"
              />
            </FormField>

            <FormField label="Počáteční datum">
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </FormField>

            <FormField label="Termín dokončení">
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </FormField>
          </div>

          {/* Poznámky */}
          <FormField label="Poznámky & Detaily">
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={5}
              placeholder="Přidej jakékoliv dodatečné informace o projektu..."
            />
          </FormField>

          {/* Tlačítka */}
          <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-lg bg-gray-200 text-gray-800 font-bold text-lg hover:bg-gray-300 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors"
            >
              {project ? '💾 Aktualizovat' : '✅ Vytvořit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
