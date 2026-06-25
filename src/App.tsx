import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import './index.css'
import Navbar from './components/Navbar'
import HybridProjectView from './components/HybridProjectView'
import EnterpriseDashboard from './components/EnterpriseDashboard'
import Contacts from './components/Contacts'
import LoginPage from './components/LoginPage'

type View = 'kanban' | 'dashboard' | 'contacts' | 'login'

function App() {
  const [currentView, setCurrentView] = useState<View>('login')
  const [user, setUser] = useState(null)

  useEffect(() => {
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
        {currentView === 'dashboard' && <EnterpriseDashboard user={user} />}
      </div>
      <Toaster position="top-right" />
    </div>
  )
}

export default App
