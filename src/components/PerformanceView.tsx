import { useFirebaseProjectStore } from '../store/firebaseProjectStore'
import { useFirebaseUserStore } from '../store/firebaseUserStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Trophy, TrendingUp } from 'lucide-react'

export default function PerformanceView() {
  const { projects } = useFirebaseProjectStore()
  const { users } = useFirebaseUserStore()

  const salespeople = users.filter(u => u.role === 'user')

  const salesData = salespeople.map(salesperson => {
    const salesPersonProjects = projects.filter(p => p.assignedTo === salesperson.id)
    const totalRevenue = salesPersonProjects.reduce((sum, p) => sum + p.revenue, 0)
    const annualTarget = (salesperson as any).annualRevenue || 0
    const percentageToTarget = annualTarget > 0 ? Math.round((totalRevenue / annualTarget) * 100) : 0

    return {
      name: salesperson.name,
      revenue: totalRevenue,
      target: annualTarget,
      percentage: percentageToTarget,
      id: salesperson.id,
    }
  }).sort((a, b) => b.revenue - a.revenue)

  const totalTeamRevenue = salesData.reduce((sum, s) => sum + s.revenue, 0)
  const totalTeamTarget = salesData.reduce((sum, s) => sum + s.target, 0)

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

  return (
    <div className="p-4 md:p-6 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Performance Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Srovnění výkonů obchodníků vůči stanoveným cílům</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-2xl p-6">
            <p className="text-gray-600 text-sm mb-1">Celkový obrat týmu</p>
            <p className="text-3xl font-bold text-gray-900">
              {totalTeamRevenue.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč
            </p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-gray-600 text-sm mb-1">Cílový obrat</p>
            <p className="text-3xl font-bold text-blue-600">
              {totalTeamTarget.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč
            </p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-gray-600 text-sm mb-1">Dosaženo k cíli</p>
            <p className="text-3xl font-bold text-green-600">
              {totalTeamTarget > 0 ? Math.round((totalTeamRevenue / totalTeamTarget) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart - Srovnění obratů */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Obraty obchodníků
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db' }}
                  formatter={(value: any) => value?.toLocaleString?.('cs-CZ', { maximumFractionDigits: 0 }) || value}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Aktuální obrat" />
                <Bar dataKey="target" fill="#3b82f6" name="Cílový obrat" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Podíly obratem */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Podíly obratem v týmu</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name}: ${Math.round((props.value / totalTeamRevenue) * 100)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {salesData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => value?.toLocaleString?.('cs-CZ', { maximumFractionDigits: 0 }) || value}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">🏆 Žebříček výkonů</h2>

          <div className="space-y-3">
            {salesData.map((person, index) => {
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  '
              const progressColor = person.percentage >= 100 ? 'bg-green-500' : person.percentage >= 75 ? 'bg-blue-500' : 'bg-yellow-500'

              return (
                <div key={person.id} className="p-4 border-2 border-gray-200 rounded-2xl hover:border-green-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{medal}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{person.name}</p>
                        <p className="text-sm text-gray-600">
                          {person.revenue.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč / {person.target.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })} Kč
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{person.percentage}%</p>
                      <p className="text-xs text-gray-600">k cíli</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${progressColor} h-3 rounded-full transition-all`}
                      style={{ width: `${Math.min(person.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {salesData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Žádní obchodníci - přidej si prvního v Nastavení
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
