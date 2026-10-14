import { useFirebaseProjectStore } from '../store/firebaseProjectStore'
import { useUserStore } from '../store/userStore'
import { Target, TrendingUp, Wallet, Trophy, AlertCircle, CheckCircle, Download, Clock } from 'lucide-react'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'
import type { OfferPhase } from '../store/projectStore'
import {
  OFFER_LABELS,
  offerPhaseOf,
  isWon,
  isLost,
  isOpen,
  weightedValue,
  opportunitiesFor,
  formatCzk,
  daysUntil,
} from '../utils/pipeline'

interface DashboardViewProps {
  user: any
}

const sum = <T,>(items: T[], pick: (item: T) => number) => items.reduce((total, item) => total + pick(item), 0)

export default function DashboardView({ user }: DashboardViewProps) {
  const { projects, acknowledgeUrgent } = useFirebaseProjectStore()
  const { users } = useUserStore()

  const opportunities = opportunitiesFor(projects, user)
  const open = opportunities.filter(isOpen)
  const won = opportunities.filter(isWon)
  const lost = opportunities.filter(isLost)

  const openValue = sum(open, p => p.revenue)
  const weightedTotal = sum(open, weightedValue)
  const wonValue = sum(won, p => p.revenue)
  const winRate = won.length + lost.length > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) : 0

  const overdue = open
    .filter(p => daysUntil(p.endDate) < 0 && !p.isUrgentAcknowledged)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
  const upcoming = open
    .filter(p => daysUntil(p.endDate) >= 0)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5)

  const phaseKeys = Object.keys(OFFER_LABELS) as OfferPhase[]
  const byPhase = phaseKeys
    .map(key => {
      const items = opportunities.filter(p => offerPhaseOf(p) === key)
      return { key, label: OFFER_LABELS[key], count: items.length, value: sum(items, p => p.revenue) }
    })
    .filter(row => row.count > 0)

  const ownerName = (id?: string) => users.find(u => u.id === id)?.name || '—'

  const handleExport = () => {
    try {
      const workbook = XLSX.utils.book_new()
      const rows: (string | number)[][] = [
        ['Příležitost', 'Zákazník', 'Obchodník', 'Fáze nabídky', 'Obrat', 'Pravděpodobnost %', 'Vážená hodnota', 'Termín'],
      ]
      opportunities.forEach(p => {
        rows.push([
          p.name,
          p.customer,
          ownerName(p.assignedTo),
          OFFER_LABELS[offerPhaseOf(p)],
          p.revenue,
          p.successProbability ?? 0,
          Math.round(weightedValue(p)),
          p.endDate,
        ])
      })
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'Příležitosti')
      XLSX.writeFile(workbook, `Solar-Vision-Prehled-${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Export do Excelu hotov')
    } catch (error) {
      console.error(error)
      toast.error('Chyba při exportu')
    }
  }

  const kpis = [
    { label: 'Otevřené příležitosti', value: open.length.toString(), sub: formatCzk(openValue), icon: Target, color: 'text-blue-600' },
    { label: 'Vážená hodnota pipeline', value: formatCzk(weightedTotal), sub: 'obrat × pravděpodobnost', icon: TrendingUp, color: 'text-indigo-600' },
    { label: 'Vyhráno', value: formatCzk(wonValue), sub: `${won.length} ${won.length === 1 ? 'nabídka' : 'nabídek'}`, icon: Trophy, color: 'text-green-600' },
    { label: 'Úspěšnost', value: `${winRate}%`, sub: `${won.length} vyhráno / ${lost.length} ztraceno`, icon: Wallet, color: 'text-amber-600' },
  ]

  return (
    <div className="p-4 md:p-6 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">Přehled obchodních příležitostí</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors w-fit"
          >
            <Download className="w-5 h-5" />
            Export do Excelu
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map(kpi => (
            <div key={kpi.label} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">{kpi.label}</p>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 font-mono">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Pipeline podle fáze nabídky</h2>
            {byPhase.length === 0 ? (
              <p className="text-sm text-gray-500">Zatím žádné příležitosti</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="py-2 text-left font-semibold">Fáze</th>
                    <th className="py-2 text-right font-semibold">Počet</th>
                    <th className="py-2 text-right font-semibold">Obrat</th>
                  </tr>
                </thead>
                <tbody>
                  {byPhase.map(row => (
                    <tr key={row.key} className="border-b border-gray-100">
                      <td className="py-2 text-gray-800">{row.label}</td>
                      <td className="py-2 text-right font-mono text-gray-700">{row.count}</td>
                      <td className="py-2 text-right font-mono text-gray-900">{formatCzk(row.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Nejbližší termíny
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-500">Žádné blížící se termíny</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map(p => (
                  <li key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 truncate">{p.customer}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-mono text-gray-800">{new Date(p.endDate).toLocaleDateString('cs-CZ')}</p>
                      <p className="text-xs text-gray-500">za {daysUntil(p.endDate)} dní</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {overdue.length > 0 && (
          <div className="glass rounded-2xl p-6 border border-red-200">
            <h2 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Po termínu ({overdue.length})
            </h2>
            <ul className="space-y-2">
              {overdue.map(p => (
                <li key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-red-50">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-600 truncate">
                      {p.customer} · termín {new Date(p.endDate).toLocaleDateString('cs-CZ')}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await acknowledgeUrgent(p.id)
                        toast.success('Označeno jako zpracované')
                      } catch {
                        toast.error('Chyba při aktualizaci')
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shrink-0"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Zpracováno
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
