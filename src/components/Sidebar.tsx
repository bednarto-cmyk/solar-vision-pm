import { useState } from 'react'
import { LayoutDashboard, Target, Users, Trophy, Settings, LogOut, Menu, X } from 'lucide-react'
import { useFirebaseProjectStore } from '../store/firebaseProjectStore'
import { useFirebaseUserStore } from '../store/firebaseUserStore'
import { opportunitiesFor, isOpen, daysUntil } from '../utils/pipeline'

export type View = 'dashboard' | 'opportunities' | 'contacts' | 'performance' | 'settings'

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
  onLogout: () => void
  user: any
}

const NAV: { view: View; label: string; icon: any; adminOnly?: boolean }[] = [
  { view: 'dashboard', label: 'Přehled', icon: LayoutDashboard },
  { view: 'opportunities', label: 'Příležitosti', icon: Target },
  { view: 'contacts', label: 'Kontakty', icon: Users },
  { view: 'performance', label: 'Performance', icon: Trophy },
  { view: 'settings', label: 'Tým a cíle', icon: Settings, adminOnly: true },
]

const initials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export default function Sidebar({ currentView, onViewChange, onLogout, user }: SidebarProps) {
  const [open, setOpen] = useState(false)
  const { projects } = useFirebaseProjectStore()
  const { users } = useFirebaseUserStore()

  const overdueCount = opportunitiesFor(projects, user).filter(
    p => isOpen(p) && !p.isUrgentAcknowledged && daysUntil(p.endDate) < 0,
  ).length

  const go = (view: View) => {
    onViewChange(view)
    setOpen(false)
  }

  const items = NAV.filter(item => !item.adminOnly || user.role === 'admin')
  const currentName = users.find(u => u.id === user.id)?.name ?? user.name

  const navContent = (
    <>
      <div className="flex items-center gap-3 px-3 pt-2 pb-6">
        <img src="/logo.svg" alt="Solar Vision" className="h-9 w-auto" />
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">CRM</span>
      </div>

      <nav className="space-y-1">
        {items.map(({ view, label, icon: Icon }) => {
          const active = currentView === view
          const badge = view === 'opportunities' && overdueCount > 0 ? overdueCount : null
          return (
            <button
              key={view}
              onClick={() => go(view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left">{label}</span>
              {badge !== null && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold flex items-center justify-center">
            {initials(currentName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{currentName}</p>
            <p className="text-xs text-gray-500">{user.role === 'admin' ? 'Administrátor' : 'Obchodník'}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100"
        >
          <LogOut className="w-5 h-5" />
          Odhlásit se
        </button>
      </div>
    </>
  )

  return (
    <>
      <header className="md:hidden fixed top-0 inset-x-0 h-14 bg-white/90 backdrop-blur border-b border-gray-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Solar Vision" className="h-7 w-auto" />
          <span className="text-sm font-semibold text-gray-900">CRM</span>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 -mr-2 text-gray-700" aria-label="Otevřít menu">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-gray-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white p-4 flex flex-col">
            <button onClick={() => setOpen(false)} className="self-end p-2 text-gray-500" aria-label="Zavřít menu">
              <X className="w-5 h-5" />
            </button>
            {navContent}
          </aside>
        </div>
      )}

      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 p-4 flex-col z-30">
        {navContent}
      </aside>
    </>
  )
}
