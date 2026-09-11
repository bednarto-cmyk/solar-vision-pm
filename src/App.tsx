import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import './index.css'
import Navbar from './components/Navbar'
import HybridProjectView from './components/HybridProjectView'
import DashboardView from './components/DashboardView'
import PerformanceView from './components/PerformanceView'
import Contacts from './components/Contacts'
import SettingsView from './components/SettingsView'
import LoginPage from './components/LoginPage'
import IdeasView from './components/IdeasView'
import { useFirebaseProjectStore } from './store/firebaseProjectStore'
import { useFirebaseUserStore } from './store/firebaseUserStore'
import { useFirebaseIdeaStore } from './store/ideaStore'

type View = 'opportunities' | 'projects' | 'dashboard' | 'performance' | 'ideas' | 'contacts' | 'settings' | 'login'

function App() {
  const [currentView, setCurrentView] = useState<View>('login')
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const initializeProjects = useFirebaseProjectStore((state) => state.initializeProjects)
  const initializeUsers = useFirebaseUserStore((state) => state.initializeUsers)
  const initializeIdeas = useFirebaseIdeaStore((state) => state.initializeIdeas)

  useEffect(() => {
    initializeProjects()
    initializeUsers()
    initializeIdeas()

    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setCurrentView('opportunities')
    }

    // Timeout to show loading state
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleLogin = (userData: any) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setCurrentView('opportunities')
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setCurrentView('login')
  }

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Načítám aplikaci...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} user={user} />
      <div className="pt-28">
        {currentView === 'opportunities' && <HybridProjectView user={user} showOnlyLeads={true} />}
        {currentView === 'projects' && <HybridProjectView user={user} showOnlyLeads={false} />}
        {currentView === 'contacts' && <Contacts currentUser={user} />}
        {currentView === 'dashboard' && <DashboardView user={user} />}
        {currentView === 'performance' && <PerformanceView user={user} />}
        {currentView === 'ideas' && <IdeasView user={user} />}
        {currentView === 'settings' && <SettingsView />}
      </div>
      <Toaster position="top-right" />
    </div>
  )
}

export default App
