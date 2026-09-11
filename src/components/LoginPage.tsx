import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useFirebaseUserStore } from '../store/firebaseUserStore'

interface LoginPageProps {
  onLogin: (userData: any) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { users, initializeUsers } = useFirebaseUserStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      initializeUsers()
      setIsInitialized(true)

      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        if (users.length === 0) {
          setIsError(true)
        }
      }, 10000)

      return () => clearTimeout(timeout)
    }
  }, [isInitialized, initializeUsers, users.length])

  const handleLogin = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      onLogin(user)
      toast.success(`Přihlášeni jako ${user.name}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-center mb-8">
          <img src="/logo.svg" alt="Solar Vision" className="h-24" />
        </div>

        <h2 className="text-center text-gray-600 mb-6">Projektové řízení & CRM</h2>

        <div className="space-y-3">
          {isError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-center text-red-700 text-sm font-medium">Chyba při načítání</p>
              <p className="text-center text-red-600 text-xs mt-2">
                Nelze se připojit k databázi. Zkus obnovit stránku (F5).
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full mt-3 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Obnovit
              </button>
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">⏳ Načítám uživatele...</p>
          ) : (
            users.map(user => (
              <button
                key={user.id}
                onClick={() => handleLogin(user.id)}
                className="w-full p-4 text-left glass rounded-2xl hover:shadow-lg transition-all hover:bg-white/80"
              >
                <div className="font-semibold text-gray-800">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {user.role === 'admin' ? 'Správce' : 'Uživatel'}
                </div>
              </button>
            ))
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Klikni na uživatele pro přihlášení
        </p>
      </div>
    </div>
  )
}
