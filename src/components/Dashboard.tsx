import { useState } from 'react'
import { TrendingUp, Users, Target, DollarSign, Settings } from 'lucide-react'
import { useProjectStore } from '../store/projectStore'
import { useWidgetStore } from '../store/widgetStore'

interface DashboardProps {
  user: any
}

const USERS = [
  { id: '1', name: 'Jan Novák', color: 'bg-blue-500' },
  { id: '2', name: 'Petr Svoboda', color: 'bg-green-500' },
  { id: '3', name: 'Marie Kučerová', color: 'bg-purple-500' },
]

export default function Dashboard({ user }: DashboardProps) {
  const { projects } = useProjectStore()
  const { widgets, toggleWidget, resetWidgets } = useWidgetStore()
  const [showSettings, setShowSettings] = useState(false)

  const userProjects = user.role === 'admin' ? projects : projects.filter(p => p.assignedTo === user.id)

  const totalRevenue = userProjects.reduce((sum, p) => sum + p.revenue, 0)
  const totalCost = userProjects.reduce((sum, p) => sum + p.cost, 0)
  const totalProfit = totalRevenue - totalCost
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0

  const getUserStats = (userId: string) => {
    const userProj = projects.filter(p => p.assignedTo === userId)
    return {
      projectCount: userProj.length,
      revenue: userProj.reduce((sum, p) => sum + p.revenue, 0),
      profit: userProj.reduce((sum, p) => sum + (p.revenue - p.cost), 0),
    }
  }

  const getStatusCount = (status: string) => {
    return projects.filter(p => p.status === status).length
  }

  const enabledWidgets = widgets.filter(w => w.enabled).sort((a, b) => a.order - b.order)

  // Widget komponenty
  const MetricWidget = ({ icon: Icon, label, value, color, size = 'normal' }: any) => (
    <div className={`card p-6 bg-gradient-to-br ${color} ${size === 'large' ? 'col-span-2' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-semibold">{label}</p>
          <p className={`${size === 'large' ? 'text-4xl' : 'text-3xl'} font-bold text-gray-900 mt-2`}>
            {value}
          </p>
        </div>
        <Icon className={`${size === 'large' ? 'w-20 h-20' : 'w-12 h-12'} text-gray-300 opacity-50`} />
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
        >
          <Settings className="w-5 h-5" />
          Nastavení widgetů
        </button>
      </div>

      {/* Widget Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Přizpůsobení Dashboard</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {widgets.map(widget => (
              <label key={widget.id} className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={widget.enabled}
                  onChange={() => toggleWidget(widget.id)}
                  className="w-5 h-5 rounded"
                />
                <span className="font-medium text-gray-800">{widget.label}</span>
              </label>
            ))}
          </div>
          <button
            onClick={() => {
              resetWidgets()
              setShowSettings(false)
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Obnovit výchozí nastavení
          </button>
        </div>
      )}

      {/* Main Metrics Grid */}
      {user.role === 'admin' && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {enabledWidgets.find(w => w.type === 'total_projects') && (
            <MetricWidget
              icon={Target}
              label="Počet projektů"
              value={userProjects.length}
              color="from-blue-50 to-blue-100"
            />
          )}

          {enabledWidgets.find(w => w.type === 'total_revenue') && (
            <MetricWidget
              icon={DollarSign}
              label="Celkový výnos"
              value={`${(totalRevenue / 1000000).toFixed(1)}M`}
              color="from-green-50 to-green-100"
            />
          )}

          {enabledWidgets.find(w => w.type === 'total_profit') && (
            <MetricWidget
              icon={TrendingUp}
              label="Celkový zisk"
              value={`${(totalProfit / 1000000).toFixed(1)}M`}
              color="from-yellow-50 to-yellow-100"
            />
          )}

          {enabledWidgets.find(w => w.type === 'profit_margin') && (
            <MetricWidget
              icon={Users}
              label="Zisková marže"
              value={`${profitMargin}%`}
              color="from-purple-50 to-purple-100"
            />
          )}
        </div>
      )}

      {/* Two-column layout for detailed widgets */}
      <div className="grid grid-cols-2 gap-6">
        {/* Team Performance */}
        {enabledWidgets.find(w => w.type === 'team_performance') && user.role === 'admin' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 Výkon týmu</h3>
            <div className="space-y-4">
              {USERS.map(u => {
                const stats = getUserStats(u.id)
                return (
                  <div key={u.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${u.color}`}></div>
                        <span className="font-bold text-gray-800">{u.name}</span>
                      </div>
                      <span className="text-sm bg-gray-100 px-3 py-1 rounded-full font-semibold">
                        {stats.projectCount} projektů
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700">
                      <div>
                        <p className="text-gray-600">Výnos</p>
                        <p className="font-bold text-green-600 text-lg">{(stats.revenue / 1000000).toFixed(2)}M Kč</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Zisk</p>
                        <p className="font-bold text-blue-600 text-lg">{(stats.profit / 1000000).toFixed(2)}M Kč</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Marže</p>
                        <p className="font-bold text-purple-600 text-lg">
                          {stats.revenue > 0 ? ((stats.profit / stats.revenue) * 100).toFixed(0) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Projects by Status */}
        {enabledWidgets.find(w => w.type === 'projects_by_status') && user.role === 'admin' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Projekty dle stavu</h3>
            <div className="space-y-3">
              {[
                { label: 'Příležitosti', key: 'leads', color: 'text-blue-600' },
                { label: 'Příprava', key: 'prep', color: 'text-green-600' },
                { label: 'Nákup', key: 'purchase', color: 'text-yellow-600' },
                { label: 'Realizace', key: 'execution', color: 'text-orange-600' },
                { label: 'Revize', key: 'revision', color: 'text-purple-600' },
                { label: 'Distribuce', key: 'distribution', color: 'text-pink-600' },
                { label: 'Servis', key: 'service', color: 'text-indigo-600' },
              ].map(s => (
                <div key={s.key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">{s.label}</span>
                  <span className={`font-bold text-xl ${s.color}`}>{getStatusCount(s.key)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Financial Overview */}
      {enabledWidgets.find(w => w.type === 'financial_overview') && (
        <div className="card p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💵 Finanční přehled</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <p className="text-gray-600 text-sm font-semibold">Celkový výnos</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {(totalRevenue / 1000000).toFixed(2)}M Kč
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
              <p className="text-gray-600 text-sm font-semibold">Celkové náklady</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {(totalCost / 1000000).toFixed(2)}M Kč
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <p className="text-gray-600 text-sm font-semibold">Celkový zisk</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {(totalProfit / 1000000).toFixed(2)}M Kč
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
