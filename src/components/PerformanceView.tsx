import { useFirebaseProjectStore } from '../store/firebaseProjectStore'
import { useFirebaseUserStore } from '../store/firebaseUserStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Trophy, TrendingUp } from 'lucide-react'
import { isWon, isLost, isOpen, weightedValue, formatCzk } from '../utils/pipeline'

interface PerformanceViewProps {
  user?: any
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

const quarterOf = (dateStr: string) => Math.floor(new Date(dateStr).getMonth() / 3)

const progressColor = (pct: number) => (pct >= 100 ? 'bg-green-500' : pct >= 75 ? 'bg-blue-500' : 'bg-yellow-500')
const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0)

export default function PerformanceView({ user }: PerformanceViewProps) {
  const { projects } = useFirebaseProjectStore()
  const { users } = useFirebaseUserStore()

  const year = new Date().getFullYear()
  const salespeople = user?.role === 'admin' ? users : users.filter(u => u.id === user?.id)

  const rows = salespeople
    .map(person => {
      const opportunities = projects.filter(p => p.status === 'leads' && p.assignedTo === person.id)
      const inYear = (p: (typeof projects)[number]) => new Date(p.endDate).getFullYear() === year
      const won = opportunities.filter(p => isWon(p) && inYear(p))
      const lost = opportunities.filter(p => isLost(p) && inYear(p))
      const open = opportunities.filter(isOpen)

      const quarterly = [0, 1, 2, 3].map(q => sum(won.filter(p => quarterOf(p.endDate) === q), p => p.revenue))
      const targetsRaw: any = (person as any).quarterlyTargets || {}
      const quarterlyTargets = [targetsRaw.q1 || 0, targetsRaw.q2 || 0, targetsRaw.q3 || 0, targetsRaw.q4 || 0]
      const target = (person as any).annualRevenue || 0
      const wonTotal = sum(won, p => p.revenue)

      return {
        id: person.id,
        name: person.name,
        won: wonTotal,
        target,
        percentage: percent(wonTotal, target),
        quarterly,
        quarterlyTargets,
        wonCount: won.length,
        lostCount: lost.length,
        pipeline: sum(open, weightedValue),
        openCount: open.length,
      }
    })
    .sort((a, b) => b.won - a.won)

  const teamWon = sum(rows, r => r.won)
  const teamTarget = sum(rows, r => r.target)
  const teamPipeline = sum(rows, r => r.pipeline)
  const teamWonCount = sum(rows, r => r.wonCount)
  const teamWinRate = percent(teamWonCount, teamWonCount + sum(rows, r => r.lostCount))
  const teamPercentage = percent(teamWon, teamTarget)

  const quarterTeam = QUARTERS.map((_, q) => ({
    revenue: sum(rows, r => r.quarterly[q]),
    target: sum(rows, r => r.quarterlyTargets[q]),
  }))

  return (
    <div className="p-4 md:p-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Performance {year}
          </h1>
          <p className="text-gray-600 mt-1">Vyhrané nabídky vůči cílům a vážená hodnota otevřené pipeline</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="card p-5">
            <p className="text-sm text-gray-600 mb-1">Vyhraný obrat týmu</p>
            <p className="text-2xl font-bold text-gray-900">{formatCzk(teamWon)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-gray-600 mb-1">Cílový obrat</p>
            <p className="text-2xl font-bold text-blue-600">{formatCzk(teamTarget)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-gray-600 mb-1">Plnění cíle</p>
            <p className="text-2xl font-bold text-green-600">{teamPercentage}%</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-gray-600 mb-1">Vážená pipeline / úspěšnost</p>
            <p className="text-2xl font-bold text-gray-900">{formatCzk(teamPipeline)}</p>
            <p className="text-xs text-gray-500 mt-1">úspěšnost {teamWinRate}%</p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Kvartály – tým</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {QUARTERS.map((label, q) => {
              const { revenue, target } = quarterTeam[q]
              const pct = percent(revenue, target)
              return (
                <div key={label} className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase">{label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{formatCzk(revenue)}</p>
                  <p className="text-xs text-gray-500">z {formatCzk(target)}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div className={`${progressColor(pct)} h-2 rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <p className="text-sm font-bold text-gray-900 mt-1">{pct}%</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Vyhraný obrat vs. cíl
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis
                  stroke="#6b7280"
                  tickFormatter={value => (value / 1000).toLocaleString('cs-CZ', { maximumFractionDigits: 0 }) + 'k'}
                />
                <Tooltip formatter={(value: any) => formatCzk(Number(value))} />
                <Legend />
                <Bar dataKey="won" fill="#10b981" name="Vyhráno" />
                <Bar dataKey="target" fill="#3b82f6" name="Cíl" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Vážená pipeline podle obchodníka</h2>
            {teamPipeline === 0 ? (
              <p className="text-center py-16 text-gray-500">Žádná otevřená pipeline</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={rows.filter(r => r.pipeline > 0)}
                    dataKey="pipeline"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(props: any) => `${props.name}: ${percent(props.value, teamPipeline)}%`}
                    labelLine={false}
                  >
                    {rows.filter(r => r.pipeline > 0).map((r, index) => (
                      <Cell key={r.id} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCzk(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">🏆 Žebříček obchodníků</h2>
          <div className="space-y-3">
            {rows.map((r, index) => {
              const medal = ['🥇', '🥈', '🥉'][index] ?? ''
              return (
                <div key={r.id} className="p-4 border-2 border-gray-200 rounded-2xl">
                  <div className="flex items-center justify-between mb-3 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl w-8 text-center">{medal}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{r.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatCzk(r.won)} / {formatCzk(r.target)} · pipeline {formatCzk(r.pipeline)} ({r.openCount} otevřené)
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-gray-900">{r.percentage}%</p>
                      <p className="text-xs text-gray-600">splněno · úspěšnost {percent(r.wonCount, r.wonCount + r.lostCount)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className={`${progressColor(r.percentage)} h-3 rounded-full`} style={{ width: `${Math.min(r.percentage, 100)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          {rows.length === 0 && <div className="text-center py-8 text-gray-500">Žádní obchodníci</div>}
        </div>

        <div className="card p-6 overflow-x-auto">
          <h2 className="text-lg font-bold text-gray-800 mb-6">📋 Kvartální srovnání</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Obchodník</th>
                {QUARTERS.map(q => (
                  <th key={q} className="px-4 py-3 text-right font-semibold text-gray-700">{q}</th>
                ))}
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Celkem</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Splnění</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  {r.quarterly.map((revenue, q) => (
                    <td key={q} className="px-4 py-3 text-right text-gray-700 text-xs">
                      {formatCzk(revenue)}
                      <span className="text-gray-500"> ({percent(revenue, r.quarterlyTargets[q])}%)</span>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCzk(r.won)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      r.percentage >= 100 ? 'bg-green-100 text-green-800' :
                      r.percentage >= 75 ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {r.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="text-center py-8 text-gray-500">Žádná data k zobrazení</div>}
        </div>
      </div>
    </div>
  )
}

function sum<T>(items: T[], pick: (item: T) => number) {
  return items.reduce((total, item) => total + pick(item), 0)
}
