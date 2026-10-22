import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Mail, Phone, Pencil, Trash2, X, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFirebaseContactStore } from '../store/firebaseContactStore'
import { useFirebaseProjectStore } from '../store/firebaseProjectStore'
import { useFirebaseUserStore } from '../store/firebaseUserStore'
import type { Contact } from '../types'
import ContactModal, { CONTACT_TYPES, type ContactFormData } from './ContactModal'
import { formatCzk, initials, isWon, isOpen, opportunitiesFor, offerPhaseOf, OFFER_LABELS } from '../utils/pipeline'

interface ContactsProps {
  currentUser: any
}

const TYPE_STYLES: Record<string, string> = {
  'vedení': 'bg-violet-50 text-violet-700',
  'nákupčí': 'bg-sky-50 text-sky-700',
  'rozhodovatel': 'bg-amber-50 text-amber-700',
  'koncový zákazník': 'bg-emerald-50 text-emerald-700',
  'jiné': 'bg-gray-100 text-gray-700',
}

export default function Contacts({ currentUser }: ContactsProps) {
  const { contacts, initializeContacts, addContact, updateContact, deleteContact } = useFirebaseContactStore()
  const { projects, initializeProjects } = useFirebaseProjectStore()
  const { users, initializeUsers } = useFirebaseUserStore()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editor, setEditor] = useState<{ contact: Contact | null } | null>(null)

  useEffect(() => {
    initializeContacts()
    initializeUsers()
    initializeProjects()
  }, [initializeContacts, initializeUsers, initializeProjects])

  const userNames = useMemo(() => Object.fromEntries(users.map(u => [u.id, u.name])), [users])
  const visibleOpportunities = useMemo(() => opportunitiesFor(projects, currentUser), [projects, currentUser])

  const statsFor = (contactId: string) => {
    const linked = visibleOpportunities.filter(p => p.contactId === contactId)
    return {
      linked,
      open: linked.filter(isOpen).length,
      won: linked.filter(isWon).reduce((total, p) => total + p.revenue, 0),
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return contacts
      .filter(c => {
        if (typeFilter && c.type !== typeFilter) return false
        if (ownerFilter && c.assignedTo !== ownerFilter) return false
        if (!term) return true
        return [c.name, c.company, c.email, c.phone].some(v => (v ?? '').toLowerCase().includes(term))
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'cs'))
  }, [contacts, search, typeFilter, ownerFilter])

  const selected = contacts.find(c => c.id === selectedId) ?? null

  const handleSave = async (data: ContactFormData) => {
    if (editor?.contact) {
      await updateContact(editor.contact.id, data, currentUser.name)
      toast.success('Kontakt uložen')
    } else {
      await addContact(data, currentUser.name)
      toast.success('Kontakt přidán')
    }
  }

  const handleDelete = async (contact: Contact) => {
    if (!window.confirm(`Smazat kontakt ${contact.name}? Příležitosti zůstanou beze změny.`)) return
    try {
      await deleteContact(contact.id)
      setSelectedId(null)
      toast.success('Kontakt smazán')
    } catch {
      toast.error('Kontakt se nepodařilo smazat')
    }
  }

  return (
    <div className="p-4 md:p-8 pb-24 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Kontakty</h1>
          <p className="text-sm text-gray-500 mt-1">{contacts.length} kontaktů v databázi</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input className="input pl-9 w-56" placeholder="Jméno, firma, e-mail…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input w-auto" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">Všechny typy</option>
            {CONTACT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select className="input w-auto" value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}>
            <option value="">Všichni obchodníci</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <button onClick={() => setEditor({ contact: null })} className="btn-primary">
            <Plus className="w-4 h-4" />
            Nový kontakt
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap min-w-[860px]">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold">Kontakt</th>
                <th className="px-4 py-3 text-left font-semibold">Typ</th>
                <th className="px-4 py-3 text-left font-semibold">Obchodník</th>
                <th className="px-4 py-3 text-right font-semibold">Otevřené</th>
                <th className="px-4 py-3 text-right font-semibold">Vyhráno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(contact => {
                const stats = statsFor(contact.id)
                return (
                  <tr key={contact.id} onClick={() => setSelectedId(contact.id)} className={`cursor-pointer hover:bg-gray-50 ${selectedId === contact.id ? 'bg-emerald-50/60' : ''}`}>
                    <td className="px-4 py-3 whitespace-normal min-w-[240px]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-center shrink-0">
                          {initials(contact.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                          <p className="text-xs text-gray-500 truncate">{contact.company || contact.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_STYLES[contact.type] ?? TYPE_STYLES['jiné']}`}>{contact.type}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{userNames[contact.assignedTo] ?? '—'}</td>
                    <td className="px-4 py-3 text-right tabular text-gray-700">{stats.open}</td>
                    <td className="px-4 py-3 text-right tabular text-gray-900">{formatCzk(stats.won)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-10 text-center text-sm text-gray-500">Žádné kontakty neodpovídají filtrům</div>}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-gray-900/30" onClick={() => setSelectedId(null)} />
          <aside className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col">
            <header className="flex items-start justify-between gap-3 p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center justify-center shrink-0">
                  {initials(selected.name)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">{selected.name}</h2>
                  <p className="text-sm text-gray-500 truncate">{selected.company || '—'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedId(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" aria-label="Zavřít">
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Otevřené příležitosti</p>
                  <p className="text-xl font-semibold text-gray-900 tabular">{statsFor(selected.id).open}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Vyhraný obrat</p>
                  <p className="text-xl font-semibold text-gray-900 tabular">{formatCzk(statsFor(selected.id).won)}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <a href={`mailto:${selected.email}`} className="flex items-center gap-3 text-gray-700 hover:text-emerald-700">
                  <Mail className="w-4 h-4 text-gray-400" /> {selected.email}
                </a>
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-3 text-gray-700 hover:text-emerald-700">
                    <Phone className="w-4 h-4 text-gray-400" /> {selected.phone}
                  </a>
                )}
                {selected.company && (
                  <p className="flex items-center gap-3 text-gray-700">
                    <Building2 className="w-4 h-4 text-gray-400" /> {selected.company}
                  </p>
                )}
                {selected.ico && (
                  <p className="text-gray-500">
                    IČO <span className="text-gray-900 tabular">{selected.ico}</span>
                    {selected.dic && <> · DIČ <span className="text-gray-900 tabular">{selected.dic}</span></>}
                  </p>
                )}
                {selected.address && <p className="text-gray-500">Sídlo: <span className="text-gray-900">{selected.address}</span></p>}
                <p className="text-gray-500">
                  Obchodník: <span className="text-gray-900">{userNames[selected.assignedTo] ?? '—'}</span> · typ{' '}
                  <span className="text-gray-900">{selected.type}</span>
                </p>
              </div>

              {selected.notes && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Poznámky</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{selected.notes}</p>
                </div>
              )}

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Příležitosti</h3>
                {statsFor(selected.id).linked.length === 0 ? (
                  <p className="text-sm text-gray-500">Zatím žádná příležitost s tímto kontaktem</p>
                ) : (
                  <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl">
                    {statsFor(selected.id).linked.map(p => (
                      <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-gray-500">{OFFER_LABELS[offerPhaseOf(p)]}</p>
                        </div>
                        <span className="text-sm tabular text-gray-800 shrink-0">{formatCzk(p.revenue)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <footer className="flex items-center justify-between gap-2 p-4 border-t border-gray-200">
              {currentUser.role === 'admin' ? (
                <button onClick={() => handleDelete(selected)} className="btn-secondary text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" /> Smazat
                </button>
              ) : (
                <span />
              )}
              <button onClick={() => setEditor({ contact: selected })} className="btn-primary">
                <Pencil className="w-4 h-4" /> Upravit
              </button>
            </footer>
          </aside>
        </div>
      )}

      {editor && (
        <ContactModal
          contact={editor.contact}
          currentUserId={currentUser.id}
          onSave={handleSave}
          onClose={() => setEditor(null)}
        />
      )}
    </div>
  )
}
