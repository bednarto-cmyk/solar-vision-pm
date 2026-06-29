import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useFirebaseUserStore } from '../store/firebaseUserStore'

interface LoginPageProps {
  onLogin: (userData: any) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { users, initializeUsers } = useFirebaseUserStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      initializeUsers()
      setIsInitialized(true)
    }
  }, [isInitialized, initializeUsers])

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
          {users.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">Načítám uživatele...</p>
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
