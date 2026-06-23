import { useState } from 'react'
import { X } from 'lucide-react'
import { useSalesTargetStore } from '../store/salesTargetStore'
import toast from 'react-hot-toast'

const USERS = [
  { id: '1', name: 'Jan Novák' },
  { id: '2', name: 'Petr Svoboda' },
  { id: '3', name: 'Marie Kučerová' },
]

const MONTHS = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
]

interface SalesTargetModalProps {
  onClose: () => void
}

export default function SalesTargetModal({ onClose }: SalesTargetModalProps) {
  const { targets, setSalesTarget } = useSalesTargetStore()
  const [selectedUser, setSelectedUser] = useState('1')
  const [yearlyTarget, setYearlyTarget] = useState(targets.find(t => t.userId === '1')?.yearlyTarget || 5000000)
  const [monthlyTargets, setMonthlyTargets] = useState(
    targets.find(t => t.userId === '1')?.monthlyBreakdown || {}
  )

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId)
    const target = targets.find(t => t.userId === userId)
    setYearlyTarget(target?.yearlyTarget || 5000000)
    setMonthlyTargets(target?.monthlyBreakdown || {})
  }

  const handleYearlyChange = (value: number) => {
    setYearlyTarget(value)
    // Auto-distribute to months
    const monthlyValue = Math.round(value / 12)
    const newMonthly: Record<string, number> = {}
    for (let i = 1; i <= 12; i++) {
      newMonthly[i.toString()] = monthlyValue
    }
    setMonthlyTargets(newMonthly)
  }

  const handleMonthlyChange = (month: number, value: number) => {
    setMonthlyTargets({
      ...monthlyTargets,
      [month.toString()]: value,
    })
  }

  const handleSave = () => {
    setSalesTarget(selectedUser, {
      userId: selectedUser,
      yearlyTarget,
      monthlyBreakdown: monthlyTargets,
    })
    toast.success(`Plán pro ${USERS.find(u => u.id === selectedUser)?.name} uložen`)
  }

  const totalMonthly = Object.values(monthlyTargets).reduce((sum, val) => sum + val, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200 px-8 py-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">⚙️ Nastavení Prodejních Plánů</h2>
          <button onClick={onClose} className="p-2 hover:bg-blue-200 rounded-lg transition-colors">
            <X className="w-7 h-7 text-gray-600" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* User Selection */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-4">
              Zvolte obchodníka
            </label>
            <div className="grid grid-cols-3 gap-4">
              {USERS.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleUserChange(user.id)}
                  className={`p-4 rounded-lg font-bold transition-all ${
                    selectedUser === user.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {user.name}
                </button>
              ))}
            </div>
          </div>

          {/* Yearly Target */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-3">
              Roční plán (Kč)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={yearlyTarget}
                onChange={(e) => handleYearlyChange(parseInt(e.target.value))}
                className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-2xl font-bold text-blue-600">
                {(yearlyTarget / 1000000).toFixed(1)}M Kč
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Průměr na měsíc: {(yearlyTarget / 12 / 1000).toFixed(0)}k Kč
            </p>
          </div>

          {/* Monthly Breakdown */}
          <div>
            <label className="block text-base font-bold text-gray-900 mb-4">
              Plán po měsících
            </label>
            <div className="grid grid-cols-4 gap-4">
              {MONTHS.map((month, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                  <p className="text-xs font-bold text-gray-600 mb-2">{month}</p>
                  <input
                    type="number"
                    value={monthlyTargets[(idx + 1).toString()] || 0}
                    onChange={(e) => handleMonthlyChange(idx + 1, parseInt(e.target.value))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    {((monthlyTargets[(idx + 1).toString()] || 0) / 1000).toFixed(0)}k
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-bold">Celkem (součet měsíců):</span> {(totalMonthly / 1000000).toFixed(1)}M Kč
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-bold">Rozdíl vs roční plán:</span> {((totalMonthly - yearlyTarget) / 1000000).toFixed(1)}M Kč
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-200">
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-lg bg-gray-200 text-gray-800 font-bold text-lg hover:bg-gray-300 transition-colors"
            >
              Zrušit
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-3 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors"
            >
              💾 Uložit Plán
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
