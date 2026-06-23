import { useState } from 'react'
import { Settings } from 'lucide-react'
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { useProjectStore } from '../store/projectStore'
import { useSalesTargetStore } from '../store/salesTargetStore'
import SalesTargetModal from './SalesTargetModal'

interface EnterpriseProps {
  user: any
}

const USERS = [
  { id: '1', name: 'Jan Novák', color: '#3b82f6' },
  { id: '2', name: 'Petr Svoboda', color: '#10b981' },
  { id: '3', name: 'Marie Kučerová', color: '#a855f7' },
]

export default function EnterpriseDashboard({ user }: EnterpriseProps) {
  const { projects } = useProjectStore()
  const { getSalesTarget } = useSalesTargetStore()
  const [showTargetModal, setShowTargetModal] = useState(false)
  // Obchodníci vidí sebe, admini vidí Jana (default)
  const [selectedUser, setSelectedUser] = useState(user.role === 'admin' ? '1' : user.id)

  const getUserStats = (userId: string) => {
    const userProj = projects.filter(p => p.assignedTo === userId)
    const revenue = userProj.reduce((sum, p) => sum + p.revenue, 0)
    const profit = userProj.reduce((sum, p) => sum + (p.revenue - p.cost), 0)
    const target = getSalesTarget(userId)

    return {
      projects: userProj,
      revenue,
      profit,
      target: target?.yearlyTarget || 0,
      monthlyBreakdown: target?.monthlyBreakdown || {},
      percentageOfTarget: target ? ((revenue / target.yearlyTarget) * 100) : 0,
    }
  }

  // Měsíční data pro graf
  const getMonthlyData = () => {
    const months = ['Led', 'Ún', 'Bře', 'Dub', 'Kvě', 'Čer', 'Črc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro']
    const selectedStats = getUserStats(selectedUser)
    const target = getSalesTarget(selectedUser)

    return months.map((month, idx) => {
      const monthNum = idx + 1
      // Simulace měsíčního výnosu (v reálu by se počítalo z dat projektů)
      const actualRevenue = (selectedStats.revenue / 12) + Math.random() * 50000
      const targetRevenue = target?.monthlyBreakdown[monthNum.toString()] || 0

      return {
        month,
        actual: Math.round(actualRevenue),
        target: targetRevenue || 0,
        percentage: (targetRevenue ?? 0) ? Math.round((actualRevenue / (targetRevenue ?? 0)) * 100) : 0,
      }
    })
  }

  // Roční plnění
  const getYearlyData = () => {
    return USERS.map(u => {
      const stats = getUserStats(u.id)
      return {
        name: u.name,
        achieved: Math.round(stats.revenue),
        target: stats.target,
        percentage: Math.round(stats.percentageOfTarget),
      }
    })
  }

  const selectedStats = getUserStats(selectedUser)
  const monthlyData = getMonthlyData()
  const yearlyData = getYearlyData()

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">📊 Sales Dashboard</h1>
          <p className="text-gray-600 mt-2">Sledování výkonu a plnění cílů obchodníků</p>
        </div>
        {user.role === 'admin' && (
          <button
            onClick={() => setShowTargetModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg"
          >
            <Settings className="w-5 h-5" />
            Nastavit plány
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-bold">ROČNÍ PLÁN</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">
            {(selectedStats.target / 1000000).toFixed(1)}M Kč
          </p>
          <p className="text-xs text-gray-500 mt-2">Obchodník: {USERS.find(u => u.id === selectedUser)?.name}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-bold">SPLNĚNÍ</p>
          <p className="text-4xl font-bold text-green-600 mt-2">
            {(selectedStats.revenue / 1000000).toFixed(1)}M Kč
          </p>
          <p className="text-xs text-gray-500 mt-2">Dosavadní výnos</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-bold">PROCENTA PLÁNU</p>
          <p className="text-4xl font-bold text-purple-600 mt-2">
            {Math.round(selectedStats.percentageOfTarget)}%
          </p>
          <p className="text-xs text-gray-500 mt-2">Z ročního cíle</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
          <p className="text-gray-600 text-sm font-bold">POČET PROJEKTŮ</p>
          <p className="text-4xl font-bold text-orange-600 mt-2">
            {selectedStats.projects.length}
          </p>
          <p className="text-xs text-gray-500 mt-2">Aktivních projektů</p>
        </div>
      </div>

      {/* User Selector - only for admins */}
      {user.role === 'admin' && (
        <div className="mb-8">
          <p className="text-sm font-bold text-gray-700 mb-3">👁️ Sledovat obchodníka:</p>
          <div className="flex gap-3">
            {USERS.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u.id)}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  selectedUser === u.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-800 border-2 border-gray-300 hover:border-blue-400'
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info for non-admin users */}
      {user.role !== 'admin' && (
        <div className="mb-8 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <p className="text-sm font-bold text-blue-900">
            👤 Zobrazuješ svou desku: <span className="text-blue-600">{USERS.find(u => u.id === user.id)?.name}</span>
          </p>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Monthly Performance Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Měsíční Výkon vs Plán</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => `${((value || 0) / 1000).toFixed(0)}k Kč`} />
              <Legend />
              <Bar dataKey="target" name="Plán" fill="#d1d5db" />
              <Bar dataKey="actual" name="Dosaženo" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Yearly Target Comparison */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Plnění Ročního Cíle</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `${((value || 0) / 1000000).toFixed(1)}M Kč`} />
              <Legend />
              <Bar dataKey="target" name="Plán" fill="#e5e7eb" />
              <Bar dataKey="achieved" name="Splnění" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Yearly Progress Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Plnění Během Roku (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Area type="monotone" dataKey="percentage" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPercentage)" name="% plánu" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Bars - All Users */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-6">👥 Porovnání Všech Obchodníků</h3>
          <div className="space-y-6">
            {yearlyData.map((user, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800">{user.name}</span>
                  <span className="text-sm font-bold text-gray-600">
                    {user.percentage}% ({(user.achieved / 1000000).toFixed(1)}M / {(user.target / 1000000).toFixed(1)}M)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      user.percentage >= 100 ? 'bg-green-500' :
                      user.percentage >= 80 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(user.percentage || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {selectedStats.projects.map((project) => (
          <div key={project.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">{project.name}</h4>
            <p className="text-xs text-gray-600 mb-3">{project.customer}</p>
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-gray-600">Výnos</p>
                <p className="font-bold text-green-600">{(project.revenue / 1000).toFixed(0)}k</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-bold text-blue-600">{project.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Target Setting Modal */}
      {showTargetModal && (
        <SalesTargetModal onClose={() => setShowTargetModal(false)} />
      )}
    </div>
  )
}
