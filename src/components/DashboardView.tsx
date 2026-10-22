import { useMemo } from 'react'
import { Target, TrendingUp, Trophy, Percent, AlertTriangle, CheckCircle2, Clock, Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'
import { useFirebaseProjectStore } from '../store/firebaseProjectStore'
import { useFirebaseUserStore } from '../store/firebaseUserStore'
import {
  PIPELINE_COLUMNS,
  OFFER_LABELS,
  columnKeyOf,
  formatCzk,
  formatDate,
  isOpen,
  isOverdue,
  isWon,
  isLost,
  daysUntil,
  offerPhaseOf,
  opportunitiesFor,
  weightedValue,
} from '../utils/pipeline'

interface DashboardViewProps {
  user: any
}

const sum = <T,>(items: T[], pick: (item: T) => number) => items.reduce((total, item) => total + pick(item), 0)

export default function DashboardView({ user }: DashboardViewProps) {
  const { projects, updateProject } = useFirebaseProjectStore()
  const { users } = useFirebaseUserStore()

  const opportunities = useMemo(() => opportunitiesFor(projects, user), [projects, user])
  const open = opportunities.filter(isOpen)
  const won = opportunities.filter(isWon)
  const lost = opportunities.filter(isLost)

  const openValue = sum(open, p => p.revenue)
  const weighted = sum(open, weightedValue)
  const wonValue = sum(won, p => p.revenue)
  const winRate = won.length + lost.length > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) : 0

  const overdue = open
    .filter(isOverdue)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
  const upcoming = open
    .filter(p => daysUntil(p.endDate) >= 0 && daysUntil(p.endDate) <= 30)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 6)

  const funnel = PIPELINE_COLUMNS.map(column => {
    const items = opportunities.filter(p => columnKeyOf(p) === column.key)
    return { ...column, count: items.length, value: sum(items, p => p.revenue) }
  })
  const maxFunnelValue = Math.max(1, ...funnel.map(f => f.value))

  const userNames = useMemo(() => Object.fromEntries(users.map(u => [u.id, u.name])), [users])

  const acknowledge = async (id: string) => {
    try {
      await updateProject(id, { isUrgentAcknowledged: true })
      toast.success('Označeno jako zpracované')
    } catch {
      toast.error('Nepodařilo se uložit')
    }
  }

  const exportXlsx = () => {
    try {
      const rows: (string | number)[][] = [
        ['Příležitost', 'Zákazník', 'Obchodník', 'Fáze nabídky', 'Obrat (Kč)', 'Pravděpodobnost (%)', 'Vážená hodnota (Kč)', 'Předpokládané uzavření'],
      ]
      opportunities.forEach(p => {
        rows.push([
          p.name,
          p.customer,
          userNames[p.assignedTo] ?? '',
          OFFER_LABELS[offerPhaseOf(p)],
          p.revenue,
          p.successProbability ?? 0,
          Math.round(weightedValue(p)),
          p.endDate,
        ])
      })
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'Příležitosti')
      XLSX.writeFile(workbook, `Solar-Vision-prehled-${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch {
      toast.error('Export se nepodařil')
    }
  }

  const kpis = [
    { label: 'Otevřené příležitosti', value: String(open.length), sub: formatCzk(openValue), icon: Target, tone: 'text-sky-600 bg-sky-50' },
    { label: 'Vážená pipeline', value: formatCzk(weighted), sub: 'obrat × pravděpodobnost', icon: TrendingUp, tone: 'text-violet-600 bg-violet-50' },
    { label: 'Vyhráno', value: formatCzk(wonValue), sub: `${won.length} ${won.length === 1 ? 'nabídka' : 'nabídek'}`, icon: Trophy, tone: 'text-emerald-600 bg-emerald-50' },
    { label: 'Úspěšnost', value: `${winRate} %`, sub: `${won.length} vyhráno · ${lost.length} ztraceno`, icon: Percent, tone: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div className="p-4 md:p-8 pb-24 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Přehled</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={exportXlsx} className="btn-secondary w-fit">
          <Download className="w-4 h-4" /> Export do Excelu
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <span className={`p-2 rounded-lg ${kpi.tone}`}>
                <kpi.icon className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-semibold text-gray-900 mt-3 tabular">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1 tabular">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <section className="card p-6 xl:col-span-3">
          <h2 className="text-base font-semibold text-gray-900">Pipeline podle fáze nabídky</h2>
          <p className="text-xs text-gray-500 mt-1">Počet a obrat příležitostí v každé fázi</p>
          <div className="mt-6 space-y-4">
            {funnel.map(stage => (
              <div key={stage.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-700">
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                    {stage.label}
                  </span>
                  <span className="text-gray-500 tabular">
                    {stage.count} · <span className="text-gray-900">{formatCzk(stage.value)}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${stage.dot}`} style={{ width: `${(stage.value / maxFunnelValue) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6 xl:col-span-2 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Po termínu
              {overdue.length > 0 && <span className="text-xs bg-red-50 text-red-700 rounded-full px-2 py-0.5">{overdue.length}</span>}
            </h2>
            {overdue.length === 0 ? (
              <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Všechny termíny jsou v pořádku
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-gray-100">
                {overdue.slice(0, 5).map(p => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-red-600">termín {formatDate(p.endDate)}</p>
                    </div>
                    <button onClick={() => acknowledge(p.id)} className="btn-secondary px-3 py-1.5 text-xs shrink-0">
                      Zpracováno
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" /> Uzavření do 30 dnů
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-500 mt-3">Žádné příležitosti se blíží k termínu</p>
            ) : (
              <ul className="mt-3 divide-y divide-gray-100">
                {upcoming.map(p => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 truncate">{p.customer}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm tabular text-gray-800">{formatDate(p.endDate)}</p>
                      <p className="text-xs text-gray-500">za {daysUntil(p.endDate)} dní</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
