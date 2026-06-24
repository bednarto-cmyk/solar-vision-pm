import toast from 'react-hot-toast'

interface LoginPageProps {
  onLogin: (userData: any) => void
}

const DEMO_USERS = [
  { id: '1', name: 'Jan Novák', email: 'jan@solar.cz', role: 'obchodnik' },
  { id: '2', name: 'Petr Svoboda', email: 'petr@solar.cz', role: 'obchodnik' },
  { id: '3', name: 'Marie Kučerová', email: 'marie@solar.cz', role: 'obchodnik' },
  { id: '4', name: 'Admin', email: 'admin@solar.cz', role: 'admin' },
]

export default function LoginPage({ onLogin }: LoginPageProps) {
  const handleLogin = (userId: string) => {
    const user = DEMO_USERS.find(u => u.id === userId)
    if (user) {
      onLogin(user)
      toast.success(`Přihlášeni jako ${user.name}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-8">
          <img src="/logo.svg" alt="Solar Vision" className="h-24" />
        </div>

        <h2 className="text-center text-gray-600 mb-6">Projektové řízení & CRM</h2>

        <div className="space-y-3">
          {DEMO_USERS.map(user => (
            <button
              key={user.id}
              onClick={() => handleLogin(user.id)}
              className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-all"
            >
              <div className="font-semibold text-gray-800">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
              <div className="text-xs text-gray-400 mt-1">
                {user.role === 'admin' ? 'Správce' : 'Obchodník'}
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Demo aplikace - klikni na uživatele pro přihlášení
        </p>
      </div>
    </div>
  )
}
