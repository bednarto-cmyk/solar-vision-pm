import { useState } from 'react'
import { X } from 'lucide-react'
import type { Contact, ContactType } from '../types'
import toast from 'react-hot-toast'

export type ContactFormData = Omit<Contact, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>

interface ContactModalProps {
  contact: Contact | null
  currentUserId: string
  onSave: (data: ContactFormData) => Promise<void>
  onClose: () => void
}

export const CONTACT_TYPES: ContactType[] = ['vedení', 'nákupčí', 'rozhodovatel', 'koncový zákazník', 'jiné']

const inputClass =
  'w-full px-3 py-2 text-sm bg-white text-gray-900 border border-gray-300 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'

export default function ContactModal({ contact, currentUserId, onSave, onClose }: ContactModalProps) {
  const [form, setForm] = useState<ContactFormData>(() =>
    contact
      ? {
          name: contact.name,
          company: contact.company,
          email: contact.email,
          phone: contact.phone,
          type: contact.type,
          assignedTo: contact.assignedTo,
          notes: contact.notes,
        }
      : { name: '', company: '', email: '', phone: '', type: 'nákupčí', assignedTo: currentUserId, notes: '' },
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (patch: Partial<ContactFormData>) => setForm(current => ({ ...current, ...patch }))
  const requiresCompany = form.type !== 'koncový zákazník'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      setError('Vyplň jméno a e-mail')
      return
    }
    if (requiresCompany && !form.company.trim()) {
      setError('Vyplň společnost')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await onSave({ ...form, name: form.name.trim(), email: form.email.trim(), company: form.company.trim() })
      onClose()
    } catch {
      toast.error('Kontakt se nepodařilo uložit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] bg-gray-900/40 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white rounded-3xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">{contact ? 'Upravit kontakt' : 'Nový kontakt'}</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" aria-label="Zavřít">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Jméno a příjmení *</span>
            <input className={`${inputClass} mt-1`} value={form.name} onChange={e => set({ name: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Společnost{requiresCompany ? ' *' : ''}</span>
            <input className={`${inputClass} mt-1`} value={form.company} onChange={e => set({ company: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-600">E-mail *</span>
            <input type="email" className={`${inputClass} mt-1`} value={form.email} onChange={e => set({ email: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Telefon</span>
            <input type="tel" className={`${inputClass} mt-1`} value={form.phone} onChange={e => set({ phone: e.target.value })} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-gray-600">Typ kontaktu</span>
            <select className={`${inputClass} mt-1`} value={form.type} onChange={e => set({ type: e.target.value as ContactType })}>
              {CONTACT_TYPES.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-gray-600">Poznámky</span>
            <textarea rows={3} className={`${inputClass} mt-1`} value={form.notes} onChange={e => set({ notes: e.target.value })} />
          </label>
          {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
          <button type="button" onClick={onClose} className="btn-secondary">Zrušit</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Ukládám…' : 'Uložit kontakt'}</button>
        </div>
      </form>
    </div>
  )
}
