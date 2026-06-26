import { useProjectStore } from '../store/projectStore'
import { TrendingUp, Target, AlertCircle, CheckCircle, Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

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
  const { projects, acknowledgeUrgent } = useProjectStore()

  const urgentProjects = projects.filter(p => {
    if (p.isUrgentAcknowledged) return false
    const daysLeft = Math.ceil((new Date(p.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft >= 0 && daysLeft <= 7
  })

  const overdueProjects = projects.filter(p => {
    if (p.isUrgentAcknowledged) return false
    return new Date(p.endDate) < new Date()
  })

  const handleExportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new()

      // Sheet 1: Overview
      const overviewData = [
        ['SOLAR VISION - Výkaz Projektů'],
        ['Datum:', new Date().toLocaleDateString('cs-CZ')],
        [],
        ['Celkový Obrat:', `${(totalRevenue / 1000000).toFixed(2)}M Kč`],
        ['Celkové Náklady:', `${(totalCost / 1000000).toFixed(2)}M Kč`],
        ['Celkový Zisk:', `${(totalProfit / 1000000).toFixed(2)}M Kč`],
        ['Průměrná Marže:', `${avgMargin.toFixed(0)}%`],
      ]
      const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData)
      XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Přehled')

      // Sheet 2: Projects
      const projectsData = [
        ['Název', 'Zákazník', 'Fáze', 'Obrat', 'Náklady', 'Zisk', 'Marže', 'Počátek', 'Termín', 'Tagy']
      ]
      projects.forEach(p => {
        const profit = p.revenue - p.cost
        const margin = ((profit / p.revenue) * 100 || 0).toFixed(0)
        projectsData.push([
          p.name,
          p.customer,
          p.status,
          p.revenue,
          p.cost,
          profit,
          `${margin}%`,
          p.startDate,
          p.endDate,
          (p.tags || []).join(', ')
        ])
      })
      const projectsSheet = XLSX.utils.aoa_to_sheet(projectsData)
      XLSX.utils.book_append_sheet(workbook, projectsSheet, 'Projekty')

      // Sheet 3: Pipeline
      const pipelineData = [
        ['Fáze', 'Počet', 'Obrat', '% z Celku']
      ]
      projectsByStatus.forEach(({ cs, count, revenue }) => {
        pipelineData.push([
          cs,
          count,
          revenue,
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
                          <button
                            onClick={() => acknowledgeUrgent(p.id)}
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
                              onClick={() => acknowledgeUrgent(p.id)}
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
      </div>
    </div>
  )
}
