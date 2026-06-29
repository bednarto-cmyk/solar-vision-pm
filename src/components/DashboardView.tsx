import { useState } from 'react'
import { useFirebaseProjectStore } from '../store/firebaseProjectStore'
import { TrendingUp, Target, AlertCircle, CheckCircle, Download, Sun, PencilLine, ShoppingCart, Zap, Plug, Settings, X } from 'lucide-react'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

const STATUS_LABELS: { [key: string]: { cs: string; icon: any; gradient: string; color: string } } = {
  leads: { cs: 'Příležitosti', icon: Sun, gradient: 'from-yellow-500/20 to-orange-600/10', color: 'text-yellow-700' },
  prep: { cs: 'Příprava', icon: PencilLine, gradient: 'from-blue-500/20 to-blue-600/10', color: 'text-blue-700' },
  purchase: { cs: 'Nákup', icon: ShoppingCart, gradient: 'from-amber-500/20 to-amber-600/10', color: 'text-amber-700' },
  execution: { cs: 'Realizace', icon: Zap, gradient: 'from-green-500/20 to-green-600/10', color: 'text-green-700' },
  revision: { cs: 'Revize', icon: CheckCircle, gradient: 'from-teal-500/20 to-teal-600/10', color: 'text-teal-700' },
  distribution: { cs: 'Distribuce', icon: Plug, gradient: 'from-cyan-500/20 to-cyan-600/10', color: 'text-cyan-700' },
  service: { cs: 'Servis', icon: Settings, gradient: 'from-indigo-500/20 to-indigo-600/10', color: 'text-indigo-700' },
}

interface DashboardViewProps {
  user: any
}

export default function DashboardView({ user }: DashboardViewProps) {
  const { projects, acknowledgeUrgent } = useFirebaseProjectStore()
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)

  const visibleProjects = user.role === 'admin' ? projects : projects.filter(p => p.assignedTo === user.id)

  const urgentProjects = visibleProjects.filter(p => {
    if (p.isUrgentAcknowledged) return false
    const daysLeft = Math.ceil((new Date(p.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft >= 0 && daysLeft <= 7
  })

  const overdueProjects = visibleProjects.filter(p => {
    if (p.isUrgentAcknowledged) return false
    return new Date(p.endDate) < new Date()
  })

  const handleExportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new()

      // Sheet 1: Overview
      const overviewData: string[][] = [
        ['SOLAR VISION - Výkaz Projektů'],
        ['Datum:', new Date().toLocaleDateString('cs-CZ')],
        [],
        ['Celkový Obrat:', formatCurrency(totalRevenue)],
        ['Celkové Náklady:', formatCurrency(totalCost)],
        ['Celkový Zisk:', formatCurrency(totalProfit)],
        ['Průměrná Marže:', `${avgMargin.toFixed(0)}%`],
      ]
      const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData)
      XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Přehled')

      // Sheet 2: Projects
      const projectsData: string[][] = [
        ['Název', 'Zákazník', 'Fáze', 'Obrat', 'Náklady', 'Zisk', 'Marže', 'Počátek', 'Termín', 'Tagy']
      ]
      projects.forEach(p => {
        const profit = p.revenue - p.cost
        const margin = ((profit / p.revenue) * 100 || 0).toFixed(0)
        projectsData.push([
          p.name,
          p.customer,
          p.status,
          p.revenue.toString(),
          p.cost.toString(),
          profit.toString(),
          `${margin}%`,
          p.startDate,
          p.endDate,
          (p.tags || []).join(', ')
        ])
      })
      const projectsSheet = XLSX.utils.aoa_to_sheet(projectsData)
      XLSX.utils.book_append_sheet(workbook, projectsSheet, 'Projekty')

      // Sheet 3: Pipeline
      const pipelineData: string[][] = [
        ['Fáze', 'Počet', 'Obrat', '% z Celku']
      ]
      projectsByStatus.forEach(({ cs, count, revenue }) => {
        pipelineData.push([
          cs,
          count.toString(),
          revenue.toString(),
          `${((revenue / totalRevenue) * 100).toFixed(1)}%`
        ])
      })
      const pipelineSheet = XLSX.utils.aoa_to_sheet(pipelineData)
      XLSX.utils.book_append_sheet(workbook, pipelineSheet, 'Pipeline')

      XLSX.writeFile(workbook, `Solar-Vision-Export-${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Export do Excelu hotov!')
    } catch (error) {
      console.error(error)
      toast.error('Chyba při exportu')
    }
  }

  const totalRevenue = visibleProjects.reduce((sum, p) => sum + p.revenue, 0)
  const totalCost = visibleProjects.reduce((sum, p) => sum + p.cost, 0)
  const totalProfit = totalRevenue - totalCost
  const avgMargin = visibleProjects.length > 0
    ? visibleProjects.reduce((sum, p) => sum + ((p.revenue - p.cost) / p.revenue || 0), 0) / visibleProjects.length * 100
    : 0

  const formatCurrency = (value: number) => {
    return value.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Kč'
  }

  const upcomingDeadlines = projects
    .filter(p => new Date(p.endDate) > new Date())
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5)

  const overduedProjects = visibleProjects.filter(p => new Date(p.endDate) < new Date())

  const projectsByStatus = Object.entries(STATUS_LABELS).map(([key, { cs, icon, gradient, color }]) => {
    const count = visibleProjects.filter(p => p.status === key).length
    const revenue = projects
      .filter(p => p.status === key)
      .reduce((sum, p) => sum + p.revenue, 0)
    return { key, cs, icon, gradient, color, count, revenue }
  })

  return (
    <div className="p-3 md:p-4 lg:p-6 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard</h1>
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            Export Excel
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Celkový Obrat</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Celkové Náklady</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalCost)}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Celkový Zisk</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalProfit)}</p>
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
            <h2 className="font-bold text-gray-800 mb-5">📈 Pipeline podle Fází</h2>
            <div className="space-y-4">
              {projectsByStatus.map(({ key, cs, icon: Icon, gradient, color, count, revenue }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`flex items-center gap-2 text-sm font-semibold ${color}`}>
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${gradient}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {cs}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {count} • {formatCurrency(revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100/50 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 transition-all duration-500"
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
              {projectsByStatus.map(({ key, cs, icon: Icon, gradient, color, count }) => (
                <button
                  key={key}
                  onClick={() => setSelectedPhase(key)}
                  className={`bg-gradient-to-br ${gradient} border border-white/30 backdrop-blur-sm rounded-2xl p-4 text-center transition-all hover:border-white/50 hover:shadow-lg cursor-pointer`}
                >
                  <p className="text-3xl font-bold text-gray-800 mb-2">{count}</p>
                  <div className={`flex items-center justify-center gap-2 text-xs font-semibold ${color}`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-gray-700">{cs}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Urgent Projects Alert */}
        {(urgentProjects.length > 0 || overdueProjects.length > 0) && (
          <div className="glass rounded-2xl p-6 mb-6 border-l-4 border-red-500 bg-red-50">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="font-bold text-gray-800 text-lg">
                🚨 {urgentProjects.length + overdueProjects.length} Urgentních Projektů
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {overdueProjects.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-red-700 mb-3">⚠️ Zpoždělé Projekty ({overdueProjects.length})</p>
                  <div className="space-y-2">
                    {overdueProjects.map(p => {
                      const daysOverdue = Math.ceil((new Date().getTime() - new Date(p.endDate).getTime()) / (1000 * 60 * 60 * 24))
                      return (
                        <div key={p.id} className="flex items-start justify-between gap-2 p-3 bg-white rounded-lg border border-red-200">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm line-clamp-1">{p.name}</p>
                            <p className="text-xs text-gray-600">{p.customer}</p>
                          </div>
                          <div className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded whitespace-nowrap">
                            -{daysOverdue} dní
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await acknowledgeUrgent(p.id)
                              } catch (error) {
                                console.error(error)
                              }
                            }}
                            className="text-xs font-medium px-2 py-1 bg-red-200 text-red-700 hover:bg-red-300 rounded transition-colors whitespace-nowrap"
                          >
                            Viděno
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {urgentProjects.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-orange-700 mb-3">⏰ Blížící se Termín ({urgentProjects.length})</p>
                  <div className="space-y-2">
                    {urgentProjects.map(p => {
                      const daysLeft = Math.ceil((new Date(p.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      return (
                        <div key={p.id} className="flex items-start justify-between gap-2 p-3 bg-white rounded-lg border border-orange-200">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm line-clamp-1">{p.name}</p>
                            <p className="text-xs text-gray-600">{p.customer}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-700 rounded whitespace-nowrap">
                              {daysLeft} dní
                            </span>
                            <button
                              onClick={async () => {
                                try {
                                  await acknowledgeUrgent(p.id)
                                } catch (error) {
                                  console.error(error)
                                }
                              }}
                              className="text-xs font-medium px-2 py-1 bg-orange-200 text-orange-700 hover:bg-orange-300 rounded transition-colors"
                            >
                              Viděno
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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

        {/* Phase Projects Modal */}
        {selectedPhase && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="sticky top-0 glass-sm p-6 border-b border-white/20 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {STATUS_LABELS[selectedPhase]?.cs} ({visibleProjects.filter(p => p.status === selectedPhase).length})
                </h2>
                <button
                  onClick={() => setSelectedPhase(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-3">
                {projects
                  .filter(p => p.status === selectedPhase)
                  .map(project => (
                    <div
                      key={project.id}
                      className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{project.name}</h3>
                          <p className="text-sm text-gray-600 mt-0.5">{project.customer}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          💰 {formatCurrency(project.revenue)}
                        </span>
                        <span className="text-gray-500">
                          📅 {new Date(project.endDate).toLocaleDateString('cs-CZ')}
                        </span>
                      </div>
                    </div>
                  ))}
                {visibleProjects.filter(p => p.status === selectedPhase).length === 0 && (
                  <p className="text-center text-gray-500 py-8">Žádné projekty v této fázi</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
