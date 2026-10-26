import { useMemo, useState } from 'react'
import { Plus, Search, LayoutGrid, Table2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFirebaseProjectStore } from '../store/firebaseProjectStore'
import { useFirebaseUserStore } from '../store/firebaseUserStore'
import type { OfferPhase, Project } from '../types'
import PipelineBoard from './PipelineBoard'
import ProjectsListTable, { type OpportunityFilters } from './ProjectsListTable'
import ProjectModal from './ProjectModal'
import ProjectKanbanModal from './ProjectKanbanModal'
import {

  PIPELINE_COLUMNS,
  type PipelineKey,
  columnKeyOf,
  formatCzk,
  isOpen,
  offerPhaseOf,
  opportunitiesFor,
  expectedProfit,
} from '../utils/pipeline'

interface OpportunitiesViewProps {
  user: any
}

const EMPTY_FILTERS: OpportunityFilters = { name: '', customer: '', owner: '', phase: '' }

export default function OpportunitiesView({ user }: OpportunitiesViewProps) {
  const { projects, updateProject } = useFirebaseProjectStore()
  const { users } = useFirebaseUserStore()
  const [mode, setMode] = useState<'board' | 'table'>('board')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<OpportunityFilters>(EMPTY_FILTERS)
  const [editingId, setEditingId] = useState<string | null | 'new'>(null)
  const [boardProjectId, setBoardProjectId] = useState<string | null>(null)

  const isAdmin = user.role === 'admin'
  const userNames = useMemo(() => Object.fromEntries(users.map(u => [u.id, u.name])), [users])
  const owners = useMemo(() => users.map(u => ({ id: u.id, name: u.name })), [users])

  const base = useMemo(() => opportunitiesFor(projects, user), [projects, user])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return base.filter(p => {
      if (term && !`${p.name} ${p.customer}`.toLowerCase().includes(term)) return false
      if (filters.name && !p.name.toLowerCase().includes(filters.name.toLowerCase())) return false
      if (filters.customer && !p.customer.toLowerCase().includes(filters.customer.toLowerCase())) return false
      if (filters.owner && p.assignedTo !== filters.owner) return false
      if (filters.phase && columnKeyOf(p) !== filters.phase) return false
      return true
    })
  }, [base, search, filters])

  const openCount = base.filter(isOpen).length
  const openValue = base.filter(isOpen).reduce((total, p) => total + p.revenue, 0)
  const weighted = base.filter(isOpen).reduce((total, p) => total + expectedProfit(p), 0)

  const editing = editingId && editingId !== 'new' ? projects.find(p => p.id === editingId) ?? null : null
  const modalOpen = editingId === 'new' || editing !== null

  const changePhase = async (project: Project, phase: OfferPhase) => {
    if (offerPhaseOf(project) === phase) return
    try {
      await updateProject(project.id, { offerPhase: phase })
      if (phase.startsWith('cancelled_')) toast('Doplň důvod ztráty v detailu příležitosti', { icon: 'ℹ️' })
    } catch {
      toast.error('Fázi se nepodařilo změnit')
    }
  }

  const movePipeline = async (project: Project, target: PipelineKey) => {
    if (target === 'lost') {
      if (columnKeyOf(project) === 'lost') return
      setEditingId(project.id)
      toast('Vyber důvod ztráty a ulož', { icon: 'ℹ️' })
      return
    }
    if (columnKeyOf(project) === target) return
    const column = PIPELINE_COLUMNS.find(c => c.key === target)
    const phase = column?.phases[0]
    if (!phase) return
    try {
      await updateProject(project.id, { offerPhase: phase })
      toast.success(`Přesunuto do: ${column?.label}`)
    } catch {
      toast.error('Příležitost se nepodařilo přesunout')
    }
  }

  const changeProbability = async (project: Project, value: number) => {
    try {
      await updateProject(project.id, { successProbability: value })
    } catch {
      toast.error('Pravděpodobnost se nepodařilo uložit')
    }
  }

  const hasFilters = search !== '' || JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS)

  return (
    <div className="p-4 md:p-8 pb-24 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Příležitosti</h1>
          <p className="text-sm text-gray-500 mt-1">
            {openCount} otevřených · {formatCzk(openValue)} · předpokládaný zisk {formatCzk(weighted)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="input pl-9 w-56"
              placeholder="Hledat příležitost…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="inline-flex p-1 bg-white border border-gray-200 rounded-xl">
            <button
              onClick={() => setMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg ${mode === 'board' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Pipeline
            </button>
            <button
              onClick={() => setMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg ${mode === 'table' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Table2 className="w-4 h-4" /> Tabulka
            </button>
          </div>
          <button onClick={() => setEditingId('new')} className="btn-primary">
            <Plus className="w-4 h-4" />
            Nová příležitost
          </button>
        </div>
      </div>

      {hasFilters && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Zobrazeno {visible.length} z {base.length}</span>
          <button
            onClick={() => {
              setSearch('')
              setFilters(EMPTY_FILTERS)
            }}
            className="text-emerald-700 hover:underline"
          >
            Zrušit filtry
          </button>
        </div>
      )}

      {mode === 'board' ? (
        <PipelineBoard
          projects={visible}
          userNames={userNames}
          onOpen={project => setEditingId(project.id)}
          onMove={movePipeline}
        />
      ) : (
        <ProjectsListTable
          projects={visible}
          userNames={userNames}
          owners={owners}
          isAdmin={isAdmin}
          filters={filters}
          onFiltersChange={setFilters}
          onOpen={project => setEditingId(project.id)}
          onPhaseChange={changePhase}
          onProbabilityChange={changeProbability}
        />
      )}

      {base.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-6">
          Zatím žádné příležitosti. Vytvoř první tlačítkem „Nová příležitost“.
        </p>
      )}

      {modalOpen && (
        <ProjectModal
          key={editingId ?? 'new'}
          project={editing}
          user={user}
          onClose={() => setEditingId(null)}
          onOpenBoard={id => setBoardProjectId(id)}
          suspended={boardProjectId !== null}
        />
      )}

      {boardProjectId && (
        <ProjectKanbanModal projectId={boardProjectId} user={user} onClose={() => setBoardProjectId(null)} />
      )}
    </div>
  )
}

