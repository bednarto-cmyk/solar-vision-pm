import { useState } from 'react'
import { LogOut, BarChart3, LayoutGrid, Menu, X, Users, Settings } from 'lucide-react'
import { useProjectStore } from '../store/projectStore'

interface NavbarProps {
  currentView: string
  onViewChange: (view: 'kanban' | 'dashboard' | 'contacts' | 'settings') => void
  onLogout: () => void
}

export default function Navbar({ currentView, onViewChange, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { projects } = useProjectStore()

  const urgentDeadlines = projects.filter(p => {
    if (p.isUrgentAcknowledged) return false
    const daysLeft = Math.ceil((new Date(p.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft >= 0 && daysLeft <= 7
  }).length

  const overdueProjects = projects.filter(p => {
    if (p.isUrgentAcknowledged) return false
    return new Date(p.endDate) < new Date()
  }).length
  const totalAlerts = urgentDeadlines + overdueProjects

  const handleNavChange = (view: 'kanban' | 'dashboard' | 'contacts' | 'settings') => {
    onViewChange(view)
    setIsMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 glass z-50 safe-top border-b border-gray-200">
      <div className="px-4 md:px-6 py-3 md:py-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Solar Vision" className="h-16" />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleNavChange('kanban')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'kanban'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
                Projekty
              </button>
              <button
                onClick={() => handleNavChange('contacts')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'contacts'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-5 h-5" />
                Kontakty
              </button>
              <button
                onClick={() => handleNavChange('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${
                  currentView === 'dashboard'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Dashboard
                {totalAlerts > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold">
                    {totalAlerts}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleNavChange('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'settings'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
                Nastavení
              </button>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Odhlásit
          </button>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Solar Vision" className="h-12" />
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4 border-t border-gray-200 pt-4">
            <button
              onClick={() => handleNavChange('kanban')}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors text-left ${
                currentView === 'kanban'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              Projekty
            </button>
            <button
              onClick={() => handleNavChange('contacts')}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors text-left ${
                currentView === 'contacts'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              Kontakty
            </button>
            <button
              onClick={() => handleNavChange('dashboard')}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors text-left ${
                currentView === 'dashboard'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => handleNavChange('settings')}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors text-left ${
                currentView === 'settings'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
              Nastavení
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-left"
            >
              <LogOut className="w-5 h-5" />
              Odhlásit
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
