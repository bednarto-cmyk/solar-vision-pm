import { useState } from 'react'
import { Plus, Sun, PencilLine, ShoppingCart, Zap, CheckCircle, Plug, Settings } from 'lucide-react'
import { useFirebaseProjectStore } from '../store/firebaseProjectStore'
import ProjectDetail from './ProjectDetail'
import ProjectModal from './ProjectModal'
import ProjectsListTable from './ProjectsListTable'

interface HybridProjectViewProps {
  user: any
}

const STATUS_LABELS: { [key: string]: { cs: string; icon: any; gradient: string; iconColor: string; accentColor: string } } = {
  leads: { cs: 'Příležitosti', icon: Sun, gradient: 'from-yellow-500/10 to-orange-600/5', iconColor: 'text-yellow-600', accentColor: 'bg-yellow-500/20' },
  prep: { cs: 'Příprava', icon: PencilLine, gradient: 'from-blue-500/10 to-blue-600/5', iconColor: 'text-blue-600', accentColor: 'bg-blue-500/20' },
  purchase: { cs: 'Nákup', icon: ShoppingCart, gradient: 'from-amber-500/10 to-amber-600/5', iconColor: 'text-amber-600', accentColor: 'bg-amber-500/20' },
  execution: { cs: 'Realizace', icon: Zap, gradient: 'from-green-500/10 to-green-600/5', iconColor: 'text-green-600', accentColor: 'bg-green-500/20' },
  revision: { cs: 'Revize', icon: CheckCircle, gradient: 'from-teal-500/10 to-teal-600/5', iconColor: 'text-teal-600', accentColor: 'bg-teal-500/20' },
  distribution: { cs: 'Distribuce', icon: Plug, gradient: 'from-cyan-500/10 to-cyan-600/5', iconColor: 'text-cyan-600', accentColor: 'bg-cyan-500/20' },
  service: { cs: 'Servis', icon: Settings, gradient: 'from-indigo-500/10 to-indigo-600/5', iconColor: 'text-indigo-600', accentColor: 'bg-indigo-500/20' },
}

export default function HybridProjectView({ user }: HybridProjectViewProps) {
  const { projects } = useFirebaseProjectStore()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  let visibleProjects = user.role === 'admin' ? projects : projects.filter(p => p.assignedTo === user.id)

  let filteredProjects = visibleProjects

  filteredProjects = filterStatus === 'urgent'
    ? filteredProjects.filter(p => {
        if (p.isUrgentAcknowledged) return false
        const daysLeft = Math.ceil((new Date(p.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return (daysLeft >= 0 && daysLeft <= 7) || new Date(p.endDate) < new Date()
      })
    : filterStatus
      ? filteredProjects.filter(p => p.status === filterStatus)
      : filteredProjects

  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filteredProjects = filteredProjects.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.customer.toLowerCase().includes(query)
    )
  }


  const handleNewProject = () => {
    setEditingProject(null)
    setIsModalOpen(true)
  }

  const handleEditProject = (project: any) => {
    setEditingProject(project)
    setIsModalOpen(true)
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

        {/* Phase Filter Badges */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filtr podle fáze</h2>
            {filterStatus && (
              <button
                onClick={() => setFilterStatus('')}
                className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Vymazat filtr
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-7 gap-2.5 lg:gap-3">
            {Object.entries(STATUS_LABELS).map(([key, { cs, icon: Icon, gradient, iconColor, accentColor }]) => {
              const count = visibleProjects.filter(p => p.status === key).length
              const isActive = filterStatus === key

              return (
                <button
                  key={key}
                  onClick={() => setFilterStatus(isActive ? '' : key)}
                  className={`group relative bg-gradient-to-br ${gradient} backdrop-blur-sm border transition-all duration-300 rounded-2xl p-4 cursor-pointer flex flex-col items-center justify-center gap-2 min-h-24 ${
                    isActive
                      ? 'border-white/80 shadow-lg shadow-black/10 ring-2 ring-offset-0'
                      : 'border-white/50 hover:border-white/80 hover:shadow-lg hover:shadow-black/5'
                  }`}
                >
                  <div className={`absolute inset-0 rounded-2xl ${accentColor} ${isActive ? 'opacity-60' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`}></div>

                  <div className="relative z-10 text-center">
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${iconColor}`} />
                    <p className="text-xs font-semibold text-gray-900 hidden lg:block">{cs}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Hledat projekt podle názvu nebo zákazníka..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
        </div>

        {/* Projects List Table */}
        <div className="mb-6">
          <ProjectsListTable
            projects={filteredProjects}
            statusLabels={STATUS_LABELS}
            onSelectProject={(project) => setSelectedProjectId(project.id)}
            selectedProjectId={selectedProjectId}
          />
        </div>

        {/* Project Detail Panel */}
        <div>
          <ProjectDetail projectId={selectedProjectId} onEditProject={handleEditProject} />
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
