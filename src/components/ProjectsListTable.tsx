import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ProjectStatus } from '../store/projectStore'

interface Project {
  id: string
  name: string
  customer: string
  status: string
  power: number
  cost: number
  revenue: number
  createdAt: string
  endDate?: string
  assignedTo?: string
  contactId?: string
}

interface User {
  id: string
  name: string
}

interface ProjectsListTableProps {
  projects: Project[]
  statusLabels: { [key: string]: { cs: string } }
  users?: User[]
  showOnlyLeads?: boolean
  onSelectProject: (project: Project) => void
  onChangePhase?: (projectId: string, newStatus: ProjectStatus) => void
  selectedProjectId: string | null
}

type SortField = 'createdAt' | 'name' | 'status' | 'customer' | 'endDate' | 'assignedTo' | 'revenue' | 'cost' | 'profit' | 'offerPhase' | 'successProbability'
type SortOrder = 'asc' | 'desc'

export default function ProjectsListTable({
  projects,
  statusLabels,
  users = [],
  showOnlyLeads = false,
  onSelectProject,
  onChangePhase,
  selectedProjectId,
}: ProjectsListTableProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const PHASES = ['leads', 'prep', 'purchase', 'execution', 'revision', 'distribution', 'service', 'completed'] as const

  const getUserName = (userId?: string) => {
    if (!userId) return '—'
    const user = users.find(u => u.id === userId)
    return user?.name || '—'
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const sortedProjects = [...projects].sort((a, b) => {
    let aVal: any = a[sortField as keyof Project]
    let bVal: any = b[sortField as keyof Project]

    if (sortField === 'profit') {
      aVal = a.revenue - a.cost
      bVal = b.revenue - b.cost
    }

    if (sortField === 'assignedTo') {
      aVal = getUserName(a.assignedTo)
      bVal = getUserName(b.assignedTo)
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = (bVal as string).toLowerCase()
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }

    if (typeof aVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    }

    return 0
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4" />
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    )
  }

  const formatCurrency = (num: number) =>
    num.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })

  const formatDate = (date: string) => new Date(date).toLocaleDateString('cs-CZ')

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  Vytvořeno <SortIcon field="createdAt" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  {showOnlyLeads ? 'Příležitost' : 'Projekt'} <SortIcon field="name" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('customer')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  Kontakt <SortIcon field="customer" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('assignedTo')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  Obchodník <SortIcon field="assignedTo" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('endDate')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                >
                  Termín dokončení <SortIcon field="endDate" />
                </button>
              </th>
              {showOnlyLeads ? (
                <>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('offerPhase')}
                      className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                    >
                      Fáze nabídky <SortIcon field="offerPhase" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('successProbability')}
                      className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                    >
                      Úspěšnost <SortIcon field="successProbability" />
                    </button>
                  </th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                    >
                      Fáze <SortIcon field="status" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleSort('cost')}
                      className="flex items-center justify-end gap-2 font-semibold text-gray-700 hover:text-gray-900 w-full"
                    >
                      Náklad <SortIcon field="cost" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleSort('revenue')}
                      className="flex items-center justify-end gap-2 font-semibold text-gray-700 hover:text-gray-900 w-full"
                    >
                      Obrat <SortIcon field="revenue" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleSort('profit')}
                      className="flex items-center justify-end gap-2 font-semibold text-gray-700 hover:text-gray-900 w-full"
                    >
                      Výnos <SortIcon field="profit" />
                    </button>
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map(project => {
              const profit = project.revenue - project.cost
              const isSelected = selectedProjectId === project.id

              return (
                <tr
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className={`border-b border-gray-200 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 text-gray-700 text-xs">
                    {formatDate(project.createdAt)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {project.name}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {project.customer}
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-sm">
                    {getUserName(project.assignedTo)}
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-xs">
                    {project.endDate ? formatDate(project.endDate) : '—'}
                  </td>
                  {showOnlyLeads ? (
                    <>
                      <td className="px-6 py-4">
                        <select
                          value={(project as any).offerPhase || ''}
                          onChange={(e) => {
                            e.stopPropagation()
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                        >
                          <option value="">Vybrat fázi</option>
                          <option value="created">Vytvořená</option>
                          <option value="sent">Předaná</option>
                          <option value="accepted">Akceptovaná</option>
                          <option value="negotiation">Jednání o SoD</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          {(project as any).successProbability || 0}%
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <select
                          value={project.status}
                          onChange={(e) => {
                            e.stopPropagation()
                            onChangePhase?.(project.id, e.target.value as ProjectStatus)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                        >
                          {PHASES.map(phase => (
                            <option key={phase} value={phase}>
                              {statusLabels[phase]?.cs || phase}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-gray-700">
                        {formatCurrency(project.cost)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-gray-900">
                        {formatCurrency(project.revenue)}
                      </td>
                      <td className={`px-6 py-4 text-right font-mono font-semibold ${
                        profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {formatCurrency(profit)}
                      </td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {projects.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          Žádné projekty
        </div>
      )}
    </div>
  )
}
