import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, AlertTriangle } from 'lucide-react'
import type { OfferPhase, Project } from '../types'
import { OFFER_LABELS, PIPELINE_COLUMNS, formatCzk, formatDate, isOverdue, offerPhaseOf, weightedValue } from '../utils/pipeline'

export interface OpportunityFilters {
  name: string
  customer: string
  owner: string
  phase: string
}

interface ProjectsListTableProps {
  projects: Project[]
  userNames: Record<string, string>
  isAdmin: boolean
  filters: OpportunityFilters
  onFiltersChange: (filters: OpportunityFilters) => void
  onOpen: (project: Project) => void
  onPhaseChange: (project: Project, phase: OfferPhase) => void
  onProbabilityChange: (project: Project, value: number) => void
  owners: { id: string; name: string }[]
}

type SortKey = 'name' | 'endDate' | 'revenue' | 'weighted' | 'phase' | 'probability'

const PHASE_OPTIONS = Object.entries(OFFER_LABELS) as [OfferPhase, string][]

const inputClass =
  'w-full px-2.5 py-1.5 text-xs bg-white text-gray-900 border border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500'

export default function ProjectsListTable({
  projects,
  userNames,
  isAdmin,
  filters,
  onFiltersChange,
  onOpen,
  onPhaseChange,
  onProbabilityChange,
  owners,
}: ProjectsListTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('endDate')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const sorted = useMemo(() => {
    const value = (p: Project): string | number => {
      switch (sortKey) {
        case 'name': return p.name.toLowerCase()
        case 'endDate': return new Date(p.endDate).getTime()
        case 'revenue': return p.revenue
        case 'weighted': return weightedValue(p)
        case 'phase': return PIPELINE_COLUMNS.findIndex(c => c.phases.includes(offerPhaseOf(p)))
        case 'probability': return p.successProbability ?? 0
      }
    }
    return [...projects].sort((a, b) => {
      const va = value(a)
      const vb = value(b)
      const result = va < vb ? -1 : va > vb ? 1 : 0
      return sortDir === 'asc' ? result : -result
    })
  }, [projects, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(dir => (dir === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const header = (label: string, key: SortKey, align: 'left' | 'right' = 'left') => (
    <th className={`px-4 py-3 font-semibold ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button
        onClick={() => toggleSort(key)}
        className={`inline-flex items-center gap-1 hover:text-gray-900 ${align === 'right' ? 'flex-row-reverse' : ''}`}
      >
        {label}
        {sortKey === key &&
          (sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
      </button>
    </th>
  )

  const setFilter = (patch: Partial<OpportunityFilters>) => onFiltersChange({ ...filters, ...patch })

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap min-w-[980px]">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr className="border-b border-gray-200">
              {header('Příležitost', 'name')}
              <th className="px-4 py-3 text-left font-semibold">Obchodník</th>
              {header('Uzavření', 'endDate')}
              {header('Fáze nabídky', 'phase')}
              {header('Obrat', 'revenue', 'right')}
              {header('Šance', 'probability', 'right')}
              {header('Vážená hodnota', 'weighted', 'right')}
            </tr>
            <tr className="border-b border-gray-200 bg-white normal-case tracking-normal">
              <th className="px-4 py-2">
                <input className={inputClass} placeholder="Hledat název…" value={filters.name} onChange={e => setFilter({ name: e.target.value })} />
              </th>
              <th className="px-4 py-2">
                {isAdmin ? (
                  <select className={inputClass} value={filters.owner} onChange={e => setFilter({ owner: e.target.value })}>
                    <option value="">Všichni</option>
                    {owners.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                ) : null}
              </th>
              <th className="px-4 py-2">
                <input className={inputClass} placeholder="Zákazník…" value={filters.customer} onChange={e => setFilter({ customer: e.target.value })} />
              </th>
              <th className="px-4 py-2">
                <select className={inputClass} value={filters.phase} onChange={e => setFilter({ phase: e.target.value })}>
                  <option value="">Všechny fáze</option>
                  {PIPELINE_COLUMNS.map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </th>
              <th colSpan={3} />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {sorted.map(project => {
              const overdue = isOverdue(project)
              return (
                <tr key={project.id} onClick={() => onOpen(project)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3 whitespace-normal min-w-[220px]">
                    <p className="font-medium text-gray-900">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.customer}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{userNames[project.assignedTo] ?? '—'}</td>
                  <td className={`px-4 py-3 tabular ${overdue ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                    <span className="flex items-center gap-1.5">
                      {overdue && <AlertTriangle className="w-3.5 h-3.5" />}
                      {formatDate(project.endDate)}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <select
                      value={offerPhaseOf(project)}
                      onChange={e => onPhaseChange(project, e.target.value as OfferPhase)}
                      className="px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {PHASE_OPTIONS.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right tabular text-gray-900">{formatCzk(project.revenue)}</td>
                  <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        defaultValue={project.successProbability ?? 0}
                        key={`${project.id}-${project.successProbability ?? 0}`}
                        onBlur={e => {
                          const next = Math.min(100, Math.max(0, Number(e.target.value) || 0))
                          if (next !== (project.successProbability ?? 0)) onProbabilityChange(project, next)
                        }}
                        className="w-16 px-2 py-1 text-xs text-right bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular"
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular text-emerald-700">{formatCzk(weightedValue(project))}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {sorted.length === 0 && (
        <div className="p-10 text-center text-sm text-gray-500">Žádné příležitosti neodpovídají filtrům</div>
      )}
    </div>
  )
}

