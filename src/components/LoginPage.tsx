import { useEffect, useState } from 'react'
import { useFirebaseUserStore } from '../store/firebaseUserStore'

interface LoginPageProps {
  onLogin: (userId: string) => void
  waitingForSession: boolean
}

const initials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export default function LoginPage({ onLogin, waitingForSession }: LoginPageProps) {
  const { users, initialized, initializeUsers } = useFirebaseUserStore()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    initializeUsers()
    const timer = setTimeout(() => setTimedOut(true), 10000)
    return () => clearTimeout(timer)
  }, [initializeUsers])

  const loading = !initialized || waitingForSession

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.svg" alt="Solar Vision" className="h-16 w-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900">Solar Vision CRM</h1>
          <p className="text-sm text-gray-500 mt-1">Vyber svůj účet pro přihlášení</p>
        </div>

        {loading && !timedOut && (
          <div className="flex flex-col items-center py-10 text-gray-500 text-sm">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin mb-3" />
            Načítám uživatele…
          </div>
        )}

        {loading && timedOut && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-5 text-center">
            <p className="text-sm font-medium text-red-700">Nepodařilo se načíst uživatele</p>
            <p className="text-xs text-red-600 mt-1">Zkontroluj připojení k internetu a zkus to znovu.</p>
            <button onClick={() => window.location.reload()} className="btn-primary mt-4">
              Obnovit stránku
            </button>
          </div>
        )}

        {!loading && (
          <div className="space-y-2">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => onLogin(u.id)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm flex items-center justify-center">
                  {initials(u.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <span className="text-xs text-gray-500">{u.role === 'admin' ? 'Admin' : 'Obchodník'}</span>
              </button>
            ))}
            {users.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-6">Zatím nejsou založení žádní uživatelé</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
