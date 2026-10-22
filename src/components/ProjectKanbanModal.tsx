import { useEffect, useState } from 'react'
import { X, Plus, Trash2, GripVertical, CheckCircle2, Circle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useFirebaseProjectStore } from '../store/firebaseProjectStore'
import type { ProjectStatus, ProjectTask } from '../types'

interface ProjectKanbanModalProps {
  projectId: string
  user: any
  onClose: () => void
}

const PHASES: { value: ProjectStatus; label: string; dot: string }[] = [
  { value: 'leads', label: 'Příležitost', dot: 'bg-amber-500' },
  { value: 'prep', label: 'Příprava', dot: 'bg-sky-500' },
  { value: 'purchase', label: 'Nákup', dot: 'bg-orange-500' },
  { value: 'execution', label: 'Realizace', dot: 'bg-emerald-500' },
  { value: 'revision', label: 'Revize', dot: 'bg-teal-500' },
  { value: 'distribution', label: 'Distribuce', dot: 'bg-cyan-500' },
  { value: 'service', label: 'Servis', dot: 'bg-indigo-500' },
  { value: 'completed', label: 'Hotovo', dot: 'bg-gray-500' },
]

const phaseOf = (task: ProjectTask): ProjectStatus => task.status ?? 'leads'

export default function ProjectKanbanModal({ projectId, user, onClose }: ProjectKanbanModalProps) {
  const { projects, addTask, updateTask, deleteTask } = useFirebaseProjectStore()
  const [drafts, setDrafts] = useState<Partial<Record<ProjectStatus, string>>>({})
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [overPhase, setOverPhase] = useState<ProjectStatus | null>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const project = projects.find(p => p.id === projectId)
  const canAccess = project && (user.role === 'admin' || project.assignedTo === user.id)

  if (!project) {
    return (
      <div className="fixed inset-0 z-[70] bg-gray-900/40 flex items-center justify-center">
        <p className="bg-white rounded-2xl px-6 py-4 text-sm text-gray-700">Příležitost nebyla nalezena</p>
      </div>
    )
  }

  if (!canAccess) {
    return (
      <div className="fixed inset-0 z-[70] bg-gray-900/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm text-center shadow-xl">
          <p className="font-semibold text-gray-900">Nemáš přístup k této nástěnce</p>
          <p className="text-sm text-gray-500 mt-1">Vidíš jen příležitosti, které jsou přiřazené tobě.</p>
          <button onClick={onClose} className="btn-primary mt-4">Zavřít</button>
        </div>
      </div>
    )
  }

  const tasks = project.tasks ?? []

  const handleAdd = async (phase: ProjectStatus) => {
    const title = drafts[phase]?.trim()
    if (!title) return
    try {
      await addTask(projectId, title, phase)
      setDrafts(current => ({ ...current, [phase]: '' }))
    } catch {
      toast.error('Úkol se nepodařilo přidat')
    }
  }

  const handleToggle = async (task: ProjectTask) => {
    try {
      await updateTask(projectId, task.id, { completed: !task.completed })
    } catch {
      toast.error('Úkol se nepodařilo uložit')
    }
  }

  const handleDelete = async (task: ProjectTask) => {
    if (!window.confirm(`Smazat úkol „${task.title}“?`)) return
    try {
      await deleteTask(projectId, task.id)
    } catch {
      toast.error('Úkol se nepodařilo smazat')
    }
  }

  const handleDrop = async (phase: ProjectStatus) => {
    const task = tasks.find(t => t.id === draggedId)
    setDraggedId(null)
    setOverPhase(null)
    if (!task || phaseOf(task) === phase) return
    try {
      await updateTask(projectId, task.id, { status: phase })
    } catch {
      toast.error('Úkol se nepodařilo přesunout')
    }
  }

  return (
    <div className="fixed inset-0 z-[70] bg-gray-100 flex flex-col">
      <header className="flex items-center justify-between gap-4 bg-white border-b border-gray-200 px-6 py-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-gray-500">Nástěnka úkolů</p>
          <h1 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h1>
          <p className="text-sm text-gray-500 truncate">{project.customer}</p>
        </div>
        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl shrink-0" aria-label="Zavřít nástěnku">
          <X className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full p-6">
          {PHASES.map(phase => {
            const items = tasks.filter(t => phaseOf(t) === phase.value)
            const isOver = overPhase === phase.value
            return (
              <section
                key={phase.value}
                onDragOver={e => {
                  e.preventDefault()
                  setOverPhase(phase.value)
                }}
                onDragLeave={() => setOverPhase(current => (current === phase.value ? null : current))}
                onDrop={e => {
                  e.preventDefault()
                  handleDrop(phase.value)
                }}
                className={`w-72 shrink-0 flex flex-col max-h-full rounded-2xl border transition-colors ${
                  isOver ? 'border-emerald-400 bg-emerald-50/60' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <header className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${phase.dot}`} />
                    <h2 className="text-sm font-semibold text-gray-800">{phase.label}</h2>
                  </div>
                  <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-2 py-0.5">{items.length}</span>
                </header>

                <div className="flex-1 overflow-y-auto px-3 space-y-2 min-h-[80px]">
                  {items.map(task => (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={e => {
                        setDraggedId(task.id)
                        e.dataTransfer.setData('text/plain', task.id)
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      onDragEnd={() => setDraggedId(null)}
                      className={`group bg-white rounded-xl border border-gray-200 p-3 shadow-sm cursor-grab active:cursor-grabbing ${
                        draggedId === task.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                        <button onClick={() => handleToggle(task)} className="mt-0.5 shrink-0" aria-label="Označit hotovo">
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <p className={`flex-1 text-sm leading-snug break-words ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </p>
                        <button
                          onClick={() => handleDelete(task)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity shrink-0"
                          aria-label="Smazat úkol"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </article>
                  ))}
                  {items.length === 0 && <p className="text-xs text-gray-400 text-center py-6">Přetáhni sem úkol</p>}
                </div>

                <div className="p-3 border-t border-gray-200/70">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 min-w-0 px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Nový úkol"
                      value={drafts[phase.value] ?? ''}
                      onChange={e => setDrafts(current => ({ ...current, [phase.value]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAdd(phase.value)
                      }}
                    />
                    <button onClick={() => handleAdd(phase.value)} className="btn-primary px-3" aria-label="Přidat úkol">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
