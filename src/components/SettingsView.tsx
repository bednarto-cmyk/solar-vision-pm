import { useState } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { useFirebaseUserStore } from '../store/firebaseUserStore'
import type { User } from '../store/userStore'
import toast from 'react-hot-toast'

export default function SettingsView() {
  const { users, addUser, deleteUser, updateUser } = useFirebaseUserStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    email: string
    role: 'admin' | 'user'
  }>({
    name: '',
    email: '',
    role: 'user',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      toast.error('Vyplň jméno a email')
      return
    }

    try {
      if (editingId) {
        await updateUser(editingId, formData)
        toast.success('Uživatel aktualizován')
        setEditingId(null)
      } else {
        await addUser({
          ...formData,
          createdAt: new Date().toISOString(),
        })
        toast.success('Uživatel přidán')
      }

      setFormData({ name: '', email: '', role: 'user' })
      setShowForm(false)
    } catch (error) {
      toast.error('Chyba při ukládání')
      console.error(error)
    }
  }

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    })
    setEditingId(user.id)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', email: '', role: 'user' })
  }

  return (
    <div className="p-4 md:p-6 min-h-screen pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">⚙️ Nastavení</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nový Uživatel
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingId ? '✏️ Editovat Uživatele' : '➕ Nový Uživatel'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jméno
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Jan Novák"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="jan@solarvision.cz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as 'admin' | 'user',
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="user">Uživatel</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {editingId ? 'Aktualizovat' : 'Přidat'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users List */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            👥 Uživatelé ({users.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Jméno
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {user.role === 'admin' ? 'Admin' : 'Uživatel'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editovat"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              window.confirm(
                                `Opravdu chceš smazat ${user.name}?`
                              )
                            ) {
                              try {
                                await deleteUser(user.id)
                                toast.success('Uživatel smazán')
                              } catch (error) {
                                toast.error('Chyba při mazání')
                              }
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Smazat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Žádní uživatelé. Přidej svého prvního!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
