import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import './index.css'
import Sidebar, { type View } from './components/Sidebar'
import OpportunitiesView from './components/OpportunitiesView'
import DashboardView from './components/DashboardView'
import PerformanceView from './components/PerformanceView'
import Contacts from './components/Contacts'
import SettingsView from './components/SettingsView'
import LoginPage from './components/LoginPage'
import { useFirebaseProjectStore } from './store/firebaseProjectStore'
import { useFirebaseUserStore } from './store/firebaseUserStore'

const SESSION_KEY = 'solarVisionUserId'

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem(SESSION_KEY))
  const { users, initialized: usersReady, initializeUsers } = useFirebaseUserStore()
  const initializeProjects = useFirebaseProjectStore(state => state.initializeProjects)

  useEffect(() => {
    localStorage.removeItem('user')
    initializeUsers()
    initializeProjects()
  }, [initializeUsers, initializeProjects])

  const user = usersReady ? users.find(u => u.id === userId) ?? null : null

  useEffect(() => {
    if (usersReady && userId && !user) {
      localStorage.removeItem(SESSION_KEY)
      setUserId(null)
    }
  }, [usersReady, userId, user])

  const handleLogin = (id: string) => {
    localStorage.setItem(SESSION_KEY, id)
    setUserId(id)
    setView('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUserId(null)
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} waitingForSession={Boolean(userId) && !usersReady} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentView={view} onViewChange={setView} onLogout={handleLogout} user={user} />
      <main className="pt-14 md:pt-0 md:pl-64 min-h-screen">
        {view === 'dashboard' && <DashboardView user={user} />}
        {view === 'opportunities' && <OpportunitiesView user={user} />}
        {view === 'contacts' && <Contacts currentUser={user} />}
        {view === 'performance' && <PerformanceView user={user} />}
        {view === 'settings' && user.role === 'admin' && <SettingsView user={user} />}
      </main>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
    </div>
  )
}

export default App
