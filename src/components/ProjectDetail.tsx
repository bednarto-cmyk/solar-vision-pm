import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useProjectStore, type ProjectStatus } from '../store/projectStore'
import toast from 'react-hot-toast'

interface ProjectDetailProps {
  projectId: string | null
  onEditProject: (project: any) => void
}

const PHASES: { value: ProjectStatus; label: string; order: number }[] = [
  { value: 'leads', label: 'Příležitosti', order: 0 },
  { value: 'prep', label: 'Příprava', order: 1 },
  { value: 'purchase', label: 'Nákup', order: 2 },
  { value: 'execution', label: 'Realizace', order: 3 },
  { value: 'revision', label: 'Revize', order: 4 },
  { value: 'distribution', label: 'Distribuce', order: 5 },
  { value: 'service', label: 'Servis', order: 6 },
]

export default function ProjectDetail({ projectId, onEditProject }: ProjectDetailProps) {
  const { projects, addTask, updateTask, deleteTask } = useProjectStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const project = projectId ? projects.find(p => p.id === projectId) : null

  if (!project) {
    return (
      <div className="glass rounded-2xl p-8 h-full flex items-center justify-center text-center">
        <div>
          <p className="text-gray-500 text-lg">Vyber projekt z seznamu</p>
          <p className="text-gray-400 text-sm mt-2">Zde uvidíš detaily a timeline</p>
        </div>
      </div>
    )
  }

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(project.id, newTaskTitle)
      setNewTaskTitle('')
      toast.success('Úkol přidán')
    }
  }

  const currentPhaseIndex = PHASES.findIndex(p => p.value === project.status)
  const completedPercentage = ((currentPhaseIndex + 1) / PHASES.length) * 100

  return (
    <div className="glass rounded-2xl p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{project.customer}</p>
          </div>
          <button
            onClick={() => onEditProject(project)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Editovat
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <span className="text-gray-600">Obrat:</span>
            <p className="font-bold text-green-600">{project.revenue.toLocaleString('cs-CZ')} Kč</p>
          </div>
          <div>
            <span className="text-gray-600">Náklad:</span>
            <p className="font-bold text-red-600">{project.cost.toLocaleString('cs-CZ')} Kč</p>
          </div>
          <div>
            <span className="text-gray-600">Výnos:</span>
            <p className="font-bold text-blue-600">{(project.revenue - project.cost).toLocaleString('cs-CZ')} Kč</p>
          </div>
          <div>
            <span className="text-gray-600">Marže:</span>
            <p className="font-bold text-purple-600">
              {((((project.revenue - project.cost) / project.revenue) * 100) || 0).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 mb-6">
        <h3 className="font-bold text-sm mb-4 text-gray-800">📅 TIMELINE PROJEKTU</h3>

        <div className="space-y-2 mb-4">
          {PHASES.map((phase) => {
            const isActive = phase.value === project.status
            const isPassed = PHASES.findIndex(p => p.value === project.status) >= phase.order
            const isCurrentOrPassed = isPassed || isActive

            return (
              <div key={phase.value} className="flex items-center gap-3">
                <div className="w-24 text-xs font-medium text-gray-700">{phase.label}</div>
                <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCurrentOrPassed
                        ? isActive
                          ? 'bg-green-500'
                          : 'bg-green-300'
                        : 'bg-gray-300'
                    }`}
                    style={{
                      width: isCurrentOrPassed ? '100%' : '0%',
                    }}
                  />
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">JE TADY →</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all"
            style={{ width: `${completedPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">{Math.round(completedPercentage)}% hotovo</p>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-bold text-sm mb-4 text-gray-800">✅ TODO LIST</h3>

        <div className="space-y-2 mb-4">
          {(project.tasks || []).length === 0 ? (
            <p className="text-sm text-gray-500 italic">Žádné úkoly. Přidej si nějaké!</p>
          ) : (
            (project.tasks || []).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-2 glass-sm rounded-lg">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => updateTask(project.id, task.id, e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span
                  className={`flex-1 text-sm ${
                    task.completed ? 'line-through text-gray-400' : 'text-gray-800'
                  }`}
                >
                  {task.title}
                </span>
                <button
                  onClick={() => {
                    deleteTask(project.id, task.id)
                    toast.success('Úkol smazán')
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Přidej nový úkol..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleAddTask}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
