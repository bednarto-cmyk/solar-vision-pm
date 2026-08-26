import { useState } from 'react'
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { useFirebaseProjectStore } from '../store/firebaseProjectStore'
import toast from 'react-hot-toast'

interface OpportunityKanbanModalProps {
  projectId: string
  onClose: () => void
}

export default function OpportunityKanbanModal({ projectId, onClose }: OpportunityKanbanModalProps) {
  const { projects, addTask, updateTask, deleteTask } = useFirebaseProjectStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const project = projects.find(p => p.id === projectId)
  const tasks = project?.tasks || []

  const completedTasks = tasks.filter(t => t.completed)
  const activeTasks = tasks.filter(t => !t.completed)

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error('Vyplň název podúkolu')
      return
    }
    try {
      await addTask(projectId, newTaskTitle)
      setNewTaskTitle('')
      toast.success('Podúkol přidán')
    } catch (error) {
      toast.error('Chyba při přidávání podúkolu')
    }
  }

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(projectId, taskId, !completed)
    } catch (error) {
      toast.error('Chyba při aktualizaci podúkolu')
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

  if (!project) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white">Projekt nenalezen</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-hidden flex flex-col" onKeyDown={(e) => {
      if (e.key === 'Escape') onClose()
    }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-6 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white">{project.name}</h1>
          <p className="text-gray-400 mt-1">🏢 {project.customer} • Fáze: <span className="text-green-400 font-semibold">{project.status}</span></p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
          title="Zavřít (ESC)"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Active Tasks */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/10 border-b border-gray-700 p-4">
              <h2 className="font-bold text-white text-lg">V řešení</h2>
              <p className="text-sm text-gray-400 mt-1">{activeTasks.length} podúkol(ů)</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      className="mt-1 p-1 text-gray-500 hover:text-green-400 transition-colors flex-shrink-0"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-200">{task.title}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {activeTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Žádné aktivní podúkoly</p>
                </div>
              )}

              {/* Add New Task */}
              <div className="pt-2 mt-4 border-t border-gray-700">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTask()
                    }
                  }}
                  placeholder="➕ Nový podúkol"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleAddTask}
                  className="w-full mt-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Přidat
                </button>
              </div>
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-gray-500/20 to-gray-600/10 border-b border-gray-700 p-4">
              <h2 className="font-bold text-white text-lg">Hotovo</h2>
              <p className="text-sm text-gray-400 mt-1">{completedTasks.length} podúkol(ů)</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4 opacity-60 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      className="mt-1 p-1 text-gray-500 hover:text-green-400 transition-colors flex-shrink-0"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </button>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-400 line-through">{task.title}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {completedTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Žádné hotové podúkoly</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-3 text-xs text-gray-400">
        <span className="text-gray-300 font-medium">ESC</span> pro zavření • <span className="text-gray-300 font-medium">Enter</span> pro přidání podúkolu
      </div>
    </div>
  )
}
