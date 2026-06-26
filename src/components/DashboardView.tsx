import { useProjectStore } from '../store/projectStore'
import { TrendingUp, Target, AlertCircle, CheckCircle } from 'lucide-react'

const STATUS_LABELS: { [key: string]: { cs: string; emoji: string } } = {
  leads: { cs: 'Příležitosti', emoji: '🟣' },
  prep: { cs: 'Příprava', emoji: '🔵' },
  purchase: { cs: 'Nákup', emoji: '🟠' },
  execution: { cs: 'Realizace', emoji: '🟢' },
  revision: { cs: 'Revize', emoji: '🟡' },
  distribution: { cs: 'Distribuce', emoji: '🔷' },
  service: { cs: 'Servis', emoji: '🟦' },
}

export default function DashboardView() {
  const { projects } = useProjectStore()

  const totalRevenue = projects.reduce((sum, p) => sum + p.revenue, 0)
  const totalCost = projects.reduce((sum, p) => sum + p.cost, 0)
  const totalProfit = totalRevenue - totalCost
  const avgMargin = projects.length > 0
    ? projects.reduce((sum, p) => sum + ((p.revenue - p.cost) / p.revenue || 0), 0) / projects.length * 100
    : 0

  const upcomingDeadlines = projects
    .filter(p => new Date(p.endDate) > new Date())
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5)

  const overduedProjects = projects.filter(p => new Date(p.endDate) < new Date())

  const projectsByStatus = Object.entries(STATUS_LABELS).map(([key, { cs, emoji }]) => {
    const count = projects.filter(p => p.status === key).length
    const revenue = projects
      .filter(p => p.status === key)
      .reduce((sum, p) => sum + p.revenue, 0)
    return { key, cs, emoji, count, revenue }
  })

  return (
    <div className="p-4 md:p-6 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">📊 Dashboard</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Celkový Obrat</p>
                <p className="text-2xl font-bold text-green-600">{(totalRevenue / 1000000).toFixed(2)}M Kč</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Celkové Náklady</p>
                <p className="text-2xl font-bold text-red-600">{(totalCost / 1000000).toFixed(2)}M Kč</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Celkový Zisk</p>
                <p className="text-2xl font-bold text-blue-600">{(totalProfit / 1000000).toFixed(2)}M Kč</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Průměrná Marže</p>
                <p className="text-2xl font-bold text-purple-600">{avgMargin.toFixed(0)}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pipeline by Status */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold text-gray-800 mb-4">📈 Pipeline podle Fází</h2>
            <div className="space-y-3">
              {projectsByStatus.map(({ key, cs, emoji, count, revenue }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {emoji} {cs}
                    </span>
                    <span className="text-sm text-gray-500">
                      {count} projektů • {(revenue / 1000000).toFixed(1)}M Kč
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(revenue / totalRevenue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Count */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold text-gray-800 mb-4">📊 Počet Projektů</h2>
            <div className="grid grid-cols-2 gap-3">
              {projectsByStatus.map(({ key, cs, emoji, count }) => (
                <div key={key} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-800 mb-1">{count}</p>
                  <p className="text-xs text-gray-600">
                    {emoji} {cs}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Deadlines */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold text-gray-800 mb-4">📅 Nadcházející Termíny</h2>
            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">Žádné termíny</p>
              ) : (
                upcomingDeadlines.map(project => {
                  const daysLeft = Math.ceil(
                    (new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  )
                  return (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm line-clamp-1">{project.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{project.customer}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                          daysLeft <= 7 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {daysLeft} dní
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Overdue Projects */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold text-gray-800 mb-4">⚠️ Zpoždené Projekty</h2>
            <div className="space-y-3">
              {overduedProjects.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">Skvěle! Žádné zpoždění 🎉</p>
              ) : (
                overduedProjects.map(project => {
                  const daysOverdue = Math.ceil(
                    (new Date().getTime() - new Date(project.endDate).getTime()) / (1000 * 60 * 60 * 24)
                  )
                  return (
                    <div key={project.id} className="border border-red-200 rounded-lg p-3 bg-red-50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm line-clamp-1">{project.name}</p>
                          <p className="text-xs text-gray-600 mt-1">{project.customer}</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-red-200 text-red-700 rounded whitespace-nowrap">
                          -{daysOverdue} dní
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
