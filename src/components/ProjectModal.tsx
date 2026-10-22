import { useEffect, useState } from 'react'
import { X, Plus, Kanban } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFirebaseProjectStore } from '../store/firebaseProjectStore'
import { useFirebaseContactStore } from '../store/firebaseContactStore'
import { useFirebaseUserStore } from '../store/firebaseUserStore'
import type { OfferPhase, Project } from '../types'
import ContactModal from './ContactModal'
import { OFFER_LABELS, offerPhaseOf } from '../utils/pipeline'

interface ProjectModalProps {
  project: Project | null
  user: any
  onClose: () => void
  onOpenBoard: (projectId: string) => void
  suspended?: boolean
}

interface FormState {
  name: string
  contactId: string
  customer: string
  assignedTo: string
  offerPhase: OfferPhase
  successProbability: number
  revenue: number
  cost: number
  power: number
  startDate: string
  endDate: string
  tags: string[]
  notes: string
}

const daysFromNow = (days: number) => new Date(Date.now() + days * 86400000).toISOString().split('T')[0]

const emptyForm = (userId: string): FormState => ({
  name: '',
  contactId: '',
  customer: '',
  assignedTo: userId,
  offerPhase: 'created',
  successProbability: 50,
  revenue: 0,
  cost: 0,
  power: 0,
  startDate: new Date().toISOString().split('T')[0],
  endDate: daysFromNow(30),
  tags: [],
  notes: '',
})

const fromProject = (p: Project): FormState => ({
  name: p.name,
  contactId: p.contactId ?? '',
  customer: p.customer,
  assignedTo: p.assignedTo,
  offerPhase: offerPhaseOf(p),
  successProbability: p.successProbability ?? 0,
  revenue: p.revenue,
  cost: p.cost,
  power: p.power,
  startDate: p.startDate,
  endDate: p.endDate,
  tags: p.tags ?? [],
  notes: p.notes ?? '',
})

const inputClass =
  'w-full px-3 py-2 text-sm bg-white text-gray-900 border border-gray-300 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'

const Field = ({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) => (
  <label className={`block ${className}`}>
    <span className="text-xs font-medium text-gray-600">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
)

export default function ProjectModal({ project, user, onClose, onOpenBoard, suspended = false }: ProjectModalProps) {
  const { addProject, updateProject } = useFirebaseProjectStore()
  const { contacts, addContact, initializeContacts } = useFirebaseContactStore()
  const { users, initializeUsers } = useFirebaseUserStore()
  const [form, setForm] = useState<FormState>(() => (project ? fromProject(project) : emptyForm(user.id)))
  const [tagDraft, setTagDraft] = useState('')
  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({})
  const [saving, setSaving] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const isAdmin = user.role === 'admin'

  useEffect(() => {
    initializeContacts()
    initializeUsers()
  }, [initializeContacts, initializeUsers])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !contactModalOpen && !suspended) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, contactModalOpen, suspended])

  const set = (patch: Partial<FormState>) => setForm(current => ({ ...current, ...patch }))

  const addTag = () => {
    const tag = tagDraft.trim().toLowerCase()
    if (tag && !form.tags.includes(tag)) set({ tags: [...form.tags, tag] })
    setTagDraft('')
  }

  const handleContactChange = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId)
    set({ contactId, customer: contact ? contact.name : '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: { name?: string; contact?: string } = {}
    if (!form.name.trim()) nextErrors.name = 'Vyplň název příležitosti'
    if (!form.customer.trim()) nextErrors.contact = 'Vyber zákazníka'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const data = {
      name: form.name.trim(),
      contactId: form.contactId,
      customer: form.customer,
      assignedTo: isAdmin ? form.assignedTo : user.id,
      offerPhase: form.offerPhase,
      successProbability: Math.min(100, Math.max(0, form.successProbability)),
      revenue: form.revenue,
      cost: form.cost,
      power: form.power,
      startDate: form.startDate,
      endDate: form.endDate,
      tags: form.tags,
      notes: form.notes,
    }

    setSaving(true)
    try {
      if (project) {
        await updateProject(project.id, data)
        toast.success('Příležitost uložena')
      } else {
        await addProject({
          ...data,
          status: 'leads',
          phases: {},
          documents: [],
          tasks: [],
          createdAt: new Date().toISOString(),
        })
        toast.success('Příležitost vytvořena')
      }
      onClose()
    } catch (error) {
      console.error(error)
      toast.error('Příležitost se nepodařilo uložit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-gray-900/40 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{project ? 'Detail příležitosti' : 'Nová příležitost'}</h2>
            {project && <p className="text-xs text-gray-500">{project.customer}</p>}
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" aria-label="Zavřít">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="project-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Název příležitosti *" className="md:col-span-2">
              <input className={inputClass} value={form.name} onChange={e => set({ name: e.target.value })} placeholder="Např. FVE + baterie – rodina Novákova" />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </Field>

            <Field label="Zákazník *">
              <div className="flex gap-2">
                <select className={inputClass} value={form.contactId} onChange={e => handleContactChange(e.target.value)}>
                  <option value="">Vyber kontakt…</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ''}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setContactModalOpen(true)} className="btn-secondary px-3" title="Nový kontakt">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {errors.contact && <p className="text-xs text-red-600 mt-1">{errors.contact}</p>}
            </Field>

            <Field label="Obchodník">
              <select
                className={inputClass}
                value={isAdmin ? form.assignedTo : user.id}
                disabled={!isAdmin}
                onChange={e => set({ assignedTo: e.target.value })}
              >
                {(isAdmin ? users : users.filter(u => u.id === user.id)).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Fáze nabídky">
              <select className={inputClass} value={form.offerPhase} onChange={e => set({ offerPhase: e.target.value as OfferPhase })}>
                {(Object.entries(OFFER_LABELS) as [OfferPhase, string][]).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>

            <Field label="Pravděpodobnost úspěchu (%)">
              <input
                type="number"
                min={0}
                max={100}
                className={`${inputClass} tabular`}
                value={form.successProbability}
                onChange={e => set({ successProbability: Number(e.target.value) || 0 })}
              />
            </Field>
          </section>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Obrat (Kč)">
              <input type="number" min={0} className={`${inputClass} tabular`} value={form.revenue} onChange={e => set({ revenue: Number(e.target.value) || 0 })} />
            </Field>
            <Field label="Odhad nákladů (Kč)">
              <input type="number" min={0} className={`${inputClass} tabular`} value={form.cost} onChange={e => set({ cost: Number(e.target.value) || 0 })} />
            </Field>
            <Field label="Výkon (kWp)">
              <input
                type="number"
                min={0}
                step="0.01"
                className={`${inputClass} tabular`}
                value={form.power}
                onChange={e => set({ power: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Předpokládané uzavření">
              <input type="date" className={inputClass} value={form.endDate} onChange={e => set({ endDate: e.target.value })} />
            </Field>
          </section>

          <section className="space-y-4">
            <Field label="Štítky">
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  value={tagDraft}
                  onChange={e => setTagDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="Např. dotace, baterie (Enter)"
                />
                <button type="button" onClick={addTag} className="btn-secondary">Přidat</button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => set({ tags: form.tags.filter(t => t !== tag) })}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100"
                    >
                      #{tag} <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </Field>

            <Field label="Poznámky">
              <textarea rows={4} className={inputClass} value={form.notes} onChange={e => set({ notes: e.target.value })} />
            </Field>
          </section>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-200">
          {project ? (
            <button type="button" onClick={() => onOpenBoard(project.id)} className="btn-secondary">
              <Kanban className="w-4 h-4" />
              Nástěnka úkolů
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">Zrušit</button>
            <button type="submit" form="project-form" disabled={saving} className="btn-primary">
              {saving ? 'Ukládám…' : project ? 'Uložit změny' : 'Vytvořit příležitost'}
            </button>
          </div>
        </div>
      </div>

      {contactModalOpen && (
        <ContactModal
          contact={null}
          currentUserId={user.id}
          onClose={() => setContactModalOpen(false)}
          onSave={async data => {
            await addContact(data, user.name)
            toast.success('Kontakt přidán – vyber ho v seznamu')
          }}
        />
      )}
    </div>
  )
}
