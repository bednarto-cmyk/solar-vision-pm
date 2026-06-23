import { useState } from 'react'
import { Plus, Trash2, Edit2, GripHorizontal } from 'lucide-react'
import { useProjectStore, type ProjectStatus } from '../store/projectStore'
import toast from 'react-hot-toast'
import ProjectModal from './ProjectModal'

const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'leads', label: 'Příležitosti' },
  { value: 'prep', label: 'Příprava' },
  { value: 'purchase', label: 'Nákup' },
  { value: 'execution', label: 'Realizace' },
  { value: 'revision', label: 'Revize' },
  { value: 'distribution', label: 'Distribuce' },
  { value: 'service', label: 'Servis' },
]

interface KanbanProps {
  user: any
}

export default function Kanban({ user }: KanbanProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [draggedProject, setDraggedProject] = useState<any>(null)
  const { deleteProject, getProjectsByStatus, moveProject } = useProjectStore()

  const handleDelete = (projectId: string) => {
    if (window.confirm('Opravdu chceš smazat projekt?')) {
      deleteProject(projectId)
      toast.success('Projekt smazán')
    }
  }

  const handleEdit = (project: any) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const handleNewProject = () => {
    setSelectedProject(null)
    setIsModalOpen(true)
  }

  // Drag start
  const handleDragStart = (e: React.DragEvent, project: any) => {
    setDraggedProject(project)
    e.dataTransfer.effectAllowed = 'move'
  }

  // Drag over - povolí drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  // Drop - přesun projektu
  const handleDrop = (e: React.DragEvent, newStatus: ProjectStatus) => {
    e.preventDefault()
    if (draggedProject && draggedProject.status !== newStatus) {
      moveProject(draggedProject.id, newStatus)
      toast.success(`Projekt přesunut do "${newStatus}"`)
    }
    setDraggedProject(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Projekty</h2>
        <button
          onClick={handleNewProject}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nový projekt
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 pr-6">
        {STATUSES.map(status => (
          <div
            key={status.value}
            className="flex-shrink-0 w-96 bg-gray-50 rounded-lg p-4 min-h-screen"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status.value)}
          >
            <h3 className="font-semibold text-gray-700 mb-4 text-lg">{status.label}</h3>

            <div className="space-y-4">
              {getProjectsByStatus(status.value).map(project => (
                <div
                  key={project.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, project)}
                  className="card p-5 bg-white cursor-grab active:cursor-grabbing hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-300"
                >
                  <div className="flex gap-3 mb-3">
                    <GripHorizontal className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-base line-clamp-3">
                        {project.name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">{project.customer}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-2 hover:bg-blue-100 rounded transition-colors"
                        title="Editovat"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 hover:bg-red-100 rounded transition-colors"
                        title="Smazat"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg my-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">⚡ Výkon:</span>
                      <span className="font-bold text-blue-600 text-lg">{project.power} kWp</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">💰 Výnos:</span>
                      <span className="font-bold text-green-600 text-lg">
                        {(project.revenue / 1000).toFixed(0)}k Kč
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">📊 Náklady:</span>
                      <span className="font-bold text-red-600 text-lg">
                        {(project.cost / 1000).toFixed(0)}k Kč
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                      <span className="text-gray-700 font-medium">📈 Marže:</span>
                      <span className="font-bold text-purple-600 text-lg">
                        {((((project.revenue - project.cost) / project.revenue) * 100) || 0).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-300">
                    <div className="text-sm font-semibold text-gray-800">
                      📅 Termín: <span className="text-blue-600">{new Date(project.endDate).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}

              {getProjectsByStatus(status.value).length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">Žádné projekty</p>
                  <p className="text-xs mt-2">Přetáhni projekt sem</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setIsModalOpen(false)}
          user={user}
        />
      )}
    </div>
  )
}
