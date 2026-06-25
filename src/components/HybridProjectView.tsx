import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useProjectStore } from '../store/projectStore'
import ProjectDetail from './ProjectDetail'
import ProjectModal from './ProjectModal'
import toast from 'react-hot-toast'

interface HybridProjectViewProps {
  user: any
}

export default function HybridProjectView({ user }: HybridProjectViewProps) {
  const { projects, deleteProject } = useProjectStore()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')

  const filteredProjects = filterStatus
    ? projects.filter(p => p.status === filterStatus)
    : projects

  const handleNewProject = () => {
    setEditingProject(null)
    setIsModalOpen(true)
  }

  const handleEditProject = (project: any) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Opravdu chceš smazat projekt?')) {
      deleteProject(projectId)
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null)
      }
      toast.success('Projekt smazán')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      leads: 'bg-purple-100 text-purple-700',
      prep: 'bg-blue-100 text-blue-700',
      purchase: 'bg-amber-100 text-amber-700',
      execution: 'bg-green-100 text-green-700',
      revision: 'bg-orange-100 text-orange-700',
      distribution: 'bg-cyan-100 text-cyan-700',
      service: 'bg-indigo-100 text-indigo-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="p-4 md:p-6 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Projekty</h1>
          <button
            onClick={handleNewProject}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors w-fit"
          >
            <Plus className="w-5 h-5" />
            Nový Projekt
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Levá část: Seznam projektů */}
          <div className="glass rounded-2xl p-4">
            <h2 className="font-bold text-sm mb-4 text-gray-800">SEZNAM PROJEKTŮ ({filteredProjects.length})</h2>

            <div className="mb-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Všechny statusy</option>
                <option value="leads">Příležitosti</option>
                <option value="prep">Příprava</option>
                <option value="purchase">Nákup</option>
                <option value="execution">Realizace</option>
                <option value="revision">Revize</option>
                <option value="distribution">Distribuce</option>
                <option value="service">Servis</option>
              </select>
            </div>

            <div className="space-y-2">
              {filteredProjects.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-8">Žádné projekty</p>
              ) : (
                filteredProjects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`w-full p-3 text-left rounded-lg transition-all text-sm ${
                      selectedProjectId === project.id
                        ? 'glass shadow-lg border border-green-300'
                        : 'glass-sm hover:glass'
                    }`}
                  >
                    <div className="font-medium text-gray-800 line-clamp-2 mb-1">{project.name}</div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status === 'leads' && '🟣'}
                        {project.status === 'prep' && '🔵'}
                        {project.status === 'purchase' && '🟠'}
                        {project.status === 'execution' && '🟢'}
                        {project.status === 'revision' && '🟡'}
                        {project.status === 'distribution' && '🔷'}
                        {project.status === 'service' && '🟦'}
                        {' '}
                        {project.status}
                      </span>
                      <span className="text-xs text-gray-500">{(project.tasks || []).length} úkolů</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Pravá část: Detail projektu */}
          <div className="lg:col-span-2">
            <ProjectDetail projectId={selectedProjectId} onEditProject={handleEditProject} />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ProjectModal
          project={editingProject}
          onClose={() => setIsModalOpen(false)}
          user={user}
        />
      )}
    </div>
  )
}
