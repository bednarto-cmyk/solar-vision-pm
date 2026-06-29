import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import './index.css'
import Navbar from './components/Navbar'
import HybridProjectView from './components/HybridProjectView'
import DashboardView from './components/DashboardView'
import Contacts from './components/Contacts'
import SettingsView from './components/SettingsView'
import LoginPage from './components/LoginPage'
import { useFirebaseProjectStore } from './store/firebaseProjectStore'
import { useFirebaseUserStore } from './store/firebaseUserStore'

type View = 'kanban' | 'dashboard' | 'contacts' | 'settings' | 'login'

function App() {
  const [currentView, setCurrentView] = useState<View>('login')
  const [user, setUser] = useState(null)
  const initializeProjects = useFirebaseProjectStore((state) => state.initializeProjects)
  const initializeUsers = useFirebaseUserStore((state) => state.initializeUsers)

  useEffect(() => {
    initializeProjects()
    initializeUsers()

    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setCurrentView('kanban')
    }
  }, [])

  const handleLogin = (userData: any) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setCurrentView('kanban')
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setCurrentView('login')
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} />
      <div className="pt-20">
        {currentView === 'kanban' && <HybridProjectView user={user} />}
        {currentView === 'contacts' && <Contacts currentUser={user} />}
        {currentView === 'dashboard' && <DashboardView user={user} />}
        {currentView === 'settings' && <SettingsView />}
      </div>
      <Toaster position="top-right" />
    </div>
  )
}

export default App
