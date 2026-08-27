import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { useFirebaseProjectStore } from '../store/firebaseProjectStore'
import type { ProjectStatus } from '../store/projectStore'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import toast from 'react-hot-toast'
import DraggableTaskCard from './DraggableTaskCard'

interface ProjectKanbanModalProps {
  projectId: string
  onClose: () => void
  user: any
}

const PHASES: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'leads', label: 'Příležitosti', color: 'from-yellow-500/10 to-orange-600/5' },
  { value: 'prep', label: 'Příprava', color: 'from-blue-500/10 to-blue-600/5' },
  { value: 'purchase', label: 'Nákup', color: 'from-amber-500/10 to-amber-600/5' },
  { value: 'execution', label: 'Realizace', color: 'from-green-500/10 to-green-600/5' },
  { value: 'revision', label: 'Revize', color: 'from-teal-500/10 to-teal-600/5' },
  { value: 'distribution', label: 'Distribuce', color: 'from-cyan-500/10 to-cyan-600/5' },
  { value: 'service', label: 'Servis', color: 'from-indigo-500/10 to-indigo-600/5' },
  { value: 'completed', label: 'Ukončeno', color: 'from-gray-500/10 to-gray-600/5' },
]

export default function ProjectKanbanModal({ projectId, onClose, user }: ProjectKanbanModalProps) {
  const { projects, addTask, updateTask, deleteTask } = useFirebaseProjectStore()

  const [newTaskTitles, setNewTaskTitles] = useState<{ [key: string]: string }>({})

  // Admin-only access
  if (user.role !== 'admin') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Přístup zamítnut</h2>
          <p className="text-gray-600 mb-4">Pouze administrátoři mají přístup k nástěnce projektů</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Zavřít
          </button>
        </div>
      </div>
    )
  }

  const project = projects.find(p => p.id === projectId)
  if (!project) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white">Projekt nenalezen</div>
      </div>
    )
  }

  const tasks = project.tasks || []

  const getTasksByPhase = (phase: ProjectStatus) => {
    return tasks.filter(t => t.status === phase || (phase === 'leads' && !t.status))
  }

  const handleAddTask = async (phase: ProjectStatus) => {
    const title = newTaskTitles[phase]?.trim()
    if (!title) {
      toast.error('Vyplň název podúkolu')
      return
    }
    try {
      await addTask(projectId, title, phase)
      setNewTaskTitles(prev => ({ ...prev, [phase]: '' }))
      toast.success('Podúkol přidán')
    } catch (error) {
      toast.error('Chyba při přidávání podúkolu')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Opravdu chceš smazat tento podúkol?')) return
    try {
      await deleteTask(projectId, taskId)
      toast.success('Podúkol smazán')
    } catch (error) {
      toast.error('Chyba při mazání podúkolu')
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const [sourcePhase, sourceIndex] = active.id.toString().split('-')
    const [destPhase] = over.id.toString().split('-')

    if (sourcePhase === destPhase) return

    const sourceTasksList = getTasksByPhase(sourcePhase as ProjectStatus)
    const taskToMove = sourceTasksList[parseInt(sourceIndex)]

    if (!taskToMove) return

    try {
      await updateTask(projectId, taskToMove.id, { status: destPhase })
      const phaseLabel = PHASES.find(p => p.value === destPhase)?.label
      toast.success(`Podúkol přesunut do ${phaseLabel}`)
    } catch (error) {
      toast.error('Chyba při přesunu podúkolu')
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-6 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white">{project.name}</h1>
          <p className="text-gray-400 mt-1">🏢 {project.customer}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
          title="Zavřít (ESC)"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      {/* Kanban Board */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-6 h-full">
            {PHASES.map((phase) => {
              const phasesTasks = getTasksByPhase(phase.value)
              return (
                <div
                  key={phase.value}
                  className="flex-shrink-0 w-96 bg-gradient-to-br rounded-xl border border-gray-700 overflow-hidden flex flex-col"
                >
                  {/* Column Header */}
                  <div className={`bg-gradient-to-r ${phase.color} border-b border-gray-700 p-4`}>
                    <h2 className="font-bold text-gray-900 text-lg">{phase.label}</h2>
                    <p className="text-sm text-gray-600 mt-1">{phasesTasks.length} podúkol(ů)</p>
                  </div>

                  {/* Tasks Container */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-800/30">
                    {phasesTasks.map((task, index) => (
                      <DraggableTaskCard
                        key={task.id}
                        id={`${phase.value}-${index}`}
                        task={task}
                        onDelete={() => handleDeleteTask(task.id)}
                      />
                    ))}

                    {/* Add New Task */}
                    <div className="pt-2 border-t border-gray-700/50">
                      <input
                        type="text"
                        value={newTaskTitles[phase.value] || ''}
                        onChange={(e) =>
                          setNewTaskTitles(prev => ({
                            ...prev,
                            [phase.value]: e.target.value,
                          }))
                        }
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddTask(phase.value)
                          }
                        }}
                        placeholder="➕ Nový podúkol"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        onClick={() => handleAddTask(phase.value)}
                        className="w-full mt-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        Přidat
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DndContext>

      {/* Keyboard Shortcut Info */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-3 text-xs text-gray-400">
        Přetáhni karty mezi sloupci • <span className="text-gray-300 font-medium">ESC</span> pro zavření
      </div>
    </div>
  )
}
