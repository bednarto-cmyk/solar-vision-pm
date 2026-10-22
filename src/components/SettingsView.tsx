import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, ShieldAlert, Wand2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFirebaseUserStore } from '../store/firebaseUserStore'
import type { User } from '../types'
import { formatCzk } from '../utils/pipeline'

interface SettingsViewProps {
  user: any
}

interface UserForm {
  name: string
  email: string
  role: 'admin' | 'user'
  annualRevenue: number
  q1: number
  q2: number
  q3: number
  q4: number
}

const EMPTY_FORM: UserForm = { name: '', email: '', role: 'user', annualRevenue: 0, q1: 0, q2: 0, q3: 0, q4: 0 }

const inputClass =
  'w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'

const toForm = (user: User): UserForm => ({
  name: user.name,
  email: user.email,
  role: user.role,
  annualRevenue: user.annualRevenue ?? 0,
  q1: user.quarterlyTargets?.q1 ?? 0,
  q2: user.quarterlyTargets?.q2 ?? 0,
  q3: user.quarterlyTargets?.q3 ?? 0,
  q4: user.quarterlyTargets?.q4 ?? 0,
})

export default function SettingsView({ user: currentUser }: SettingsViewProps) {
  const { users, initializeUsers, addUser, updateUser, deleteUser } = useFirebaseUserStore()
  const [form, setForm] = useState<UserForm | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    initializeUsers()
  }, [initializeUsers])

  if (currentUser.role !== 'admin') {
    return (
      <div className="p-8 max-w-xl mx-auto text-center">
        <ShieldAlert className="w-10 h-10 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-700 font-medium">Nastavení týmu je dostupné jen administrátorům.</p>
      </div>
    )
  }

  const quarterlySum = form ? form.q1 + form.q2 + form.q3 + form.q4 : 0

  const startNew = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
  }

  const startEdit = (u: User) => {
    setEditingId(u.id)
    setForm(toForm(u))
  }

  const close = () => {
    setEditingId(null)
    setForm(null)
  }

  const splitEvenly = () => {
    if (!form) return
    const quarter = Math.round(form.annualRevenue / 4)
    setForm({ ...form, q1: quarter, q2: quarter, q3: quarter, q4: quarter })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Vyplň jméno a e-mail')
      return
    }
    const data = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      annualRevenue: form.annualRevenue,
      quarterlyTargets: { q1: form.q1, q2: form.q2, q3: form.q3, q4: form.q4 },
    }
    setSaving(true)
    try {
      if (editingId) {
        await updateUser(editingId, data)
        toast.success('Uživatel uložen')
      } else {
        await addUser({ ...data, createdAt: new Date().toISOString() })
        toast.success('Uživatel přidán')
      }
      close()
    } catch (error) {
      console.error(error)
      toast.error('Uživatele se nepodařilo uložit')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (target: User) => {
    if (target.id === currentUser.id) {
      toast.error('Sám sebe smazat nelze')
      return
    }
    if (!window.confirm(`Opravdu smazat uživatele ${target.name}?`)) return
    try {
      await deleteUser(target.id)
      toast.success('Uživatel smazán')
    } catch {
      toast.error('Uživatele se nepodařilo smazat')
    }
  }

  return (
    <div className="p-4 md:p-8 pb-24">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tým a cíle</h1>
            <p className="text-sm text-gray-500 mt-1">Obchodníci, role a plánované obraty. Změny se propíšou do celé aplikace.</p>
          </div>
          <button
            onClick={startNew}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors w-fit"
          >
            <Plus className="w-4 h-4" />
            Nový uživatel
          </button>
        </div>

        {form && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-semibold text-gray-900">
              {editingId ? 'Upravit uživatele' : 'Nový uživatel'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-xs font-medium text-gray-600">Jméno</span>
                <input className={`${inputClass} mt-1`} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jan Novák" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-gray-600">E-mail</span>
                <input type="email" className={`${inputClass} mt-1`} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jan@solarvision.cz" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-gray-600">Role</span>
                <select className={`${inputClass} mt-1`} value={form.role} onChange={e => setForm({ ...form, role: e.target.value as 'admin' | 'user' })}>
                  <option value="user">Obchodník</option>
                  <option value="admin">Administrátor</option>
                </select>
              </label>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <label className="block flex-1">
                  <span className="text-xs font-medium text-gray-600">Roční cíl obratu (Kč)</span>
                  <input
                    type="number"
                    min={0}
                    className={`${inputClass} mt-1`}
                    value={form.annualRevenue}
                    onChange={e => setForm({ ...form, annualRevenue: Number(e.target.value) || 0 })}
                  />
                </label>
                <button type="button" onClick={splitEvenly} className="flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50">
                  <Wand2 className="w-4 h-4" />
                  Rozdělit na kvartály
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {(['q1', 'q2', 'q3', 'q4'] as const).map((q, i) => (
                  <label key={q} className="block">
                    <span className="text-xs font-medium text-gray-600">Q{i + 1} cíl (Kč)</span>
                    <input
                      type="number"
                      min={0}
                      className={`${inputClass} mt-1`}
                      value={form[q]}
                      onChange={e => setForm({ ...form, [q]: Number(e.target.value) || 0 })}
                    />
                  </label>
                ))}
              </div>
              {quarterlySum !== form.annualRevenue && form.annualRevenue > 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  Součet kvartálů ({formatCzk(quarterlySum)}) se neshoduje s ročním cílem ({formatCzk(form.annualRevenue)}).
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={close} className="px-4 py-2 text-sm rounded-xl border border-gray-300 hover:bg-gray-50">
                Zrušit
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60">
                {saving ? 'Ukládám…' : editingId ? 'Uložit změny' : 'Přidat uživatele'}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap min-w-[680px]">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Jméno</th>
                  <th className="px-5 py-3 font-semibold">E-mail</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold text-right">Roční cíl</th>
                  <th className="px-5 py-3 font-semibold text-right">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-5 py-3 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
                        {u.role === 'admin' ? 'Administrátor' : 'Obchodník'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-800">{formatCzk(u.annualRevenue ?? 0)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => startEdit(u)} className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg" title="Upravit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(u)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Smazat">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && <div className="p-8 text-center text-gray-500">Zatím žádní uživatelé</div>}
        </div>
      </div>
    </div>
  )
}
