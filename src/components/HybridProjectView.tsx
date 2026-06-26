import { useState } from 'react'
import { Plus, Trash2, Lightbulb, ClipboardList, ShoppingCart, Zap, CheckCircle, Truck, Wrench } from 'lucide-react'
import { useProjectStore } from '../store/projectStore'
import ProjectDetail from './ProjectDetail'
import ProjectModal from './ProjectModal'
import toast from 'react-hot-toast'

interface HybridProjectViewProps {
  user: any
}

const STATUS_LABELS: { [key: string]: { cs: string; icon: any; bgColor: string; borderColor: string; textColor: string } } = {
  leads: { cs: 'Příležitosti', icon: Lightbulb, bgColor: 'bg-purple-50', borderColor: 'border-purple-300', textColor: 'text-purple-700' },
  prep: { cs: 'Příprava', icon: ClipboardList, bgColor: 'bg-blue-50', borderColor: 'border-blue-300', textColor: 'text-blue-700' },
  purchase: { cs: 'Nákup', icon: ShoppingCart, bgColor: 'bg-amber-50', borderColor: 'border-amber-300', textColor: 'text-amber-700' },
  execution: { cs: 'Realizace', icon: Zap, bgColor: 'bg-green-50', borderColor: 'border-green-300', textColor: 'text-green-700' },
  revision: { cs: 'Revize', icon: CheckCircle, bgColor: 'bg-yellow-50', borderColor: 'border-yellow-300', textColor: 'text-yellow-700' },
  distribution: { cs: 'Distribuce', icon: Truck, bgColor: 'bg-cyan-50', borderColor: 'border-cyan-300', textColor: 'text-cyan-700' },
  service: { cs: 'Servis', icon: Wrench, bgColor: 'bg-indigo-50', borderColor: 'border-indigo-300', textColor: 'text-indigo-700' },
}

export default function HybridProjectView({ user }: HybridProjectViewProps) {
  const { projects, deleteProject } = useProjectStore()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [draggedProject, setDraggedProject] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const { moveProject } = useProjectStore()

  let filteredProjects = filterStatus === 'urgent'
    ? projects.filter(p => {
        if (p.isUrgentAcknowledged) return false
        const daysLeft = Math.ceil((new Date(p.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return (daysLeft >= 0 && daysLeft <= 7) || new Date(p.endDate) < new Date()
      })
    : filterStatus
      ? projects.filter(p => p.status === filterStatus)
      : projects

  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filteredProjects = filteredProjects.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.customer.toLowerCase().includes(query)
    )
  }

  const handleDragStart = (e: React.DragEvent, project: any) => {
    setDraggedProject(project)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (draggedProject && draggedProject.status !== newStatus) {
      moveProject(draggedProject.id, newStatus as any)
      toast.success(`Přesunuto do ${STATUS_LABELS[newStatus]?.cs}`)
      setSelectedProjectId(draggedProject.id)
    }
    setDraggedProject(null)
  }

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

        {/* Drag & Drop Kanban Board */}
        <div className="glass rounded-2xl p-4 lg:p-5 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">📊 Přetáhni projekt mezi fázemi</h2>
          <div className="grid grid-cols-2 lg:grid-cols-7 gap-2 lg:gap-3">
            {Object.entries(STATUS_LABELS).map(([key, { cs, icon: Icon, bgColor, borderColor, textColor }]) => (
              <div
                key={key}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, key)}
                className={`rounded-xl p-3 min-h-32 border-2 border-dashed transition-all hover:shadow-md ${bgColor} ${borderColor} hover:border-opacity-100`}
              >
                <div className={`flex items-center gap-1.5 mb-2 ${textColor}`}>
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  <p className="text-xs lg:text-sm font-semibold hidden lg:inline">{cs}</p>
                </div>
                <div className="space-y-1.5">
                  {projects
                    .filter(p => p.status === key)
                    .slice(0, 2)
                    .map(p => (
                      <div
                        key={p.id}
                        className="text-xs bg-white p-1.5 rounded border border-gray-200 truncate cursor-move hover:bg-green-50"
                        draggable
                        onDragStart={(e) => handleDragStart(e, p)}
                        title={p.name}
                      >
                        {p.name.substring(0, 15)}
                      </div>
                    ))}
                  {projects.filter(p => p.status === key).length > 2 && (
                    <div className="text-xs text-gray-500 p-1">
                      +{projects.filter(p => p.status === key).length - 2}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Levá část: Seznam projektů (mobile: full width, desktop: 1 col) */}
          <div className="lg:col-span-1 glass rounded-2xl p-4 lg:p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800">📋 PROJEKTY</h2>
              <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-sm font-semibold">{filteredProjects.length}</span>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-600 mb-2">🔍 Hledat</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Název nebo zákazník..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white mb-4"
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-600 mb-2">Filtr podle fáze</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">✨ Všechny fáze</option>
                <option value="urgent">🚨 Jen urgentní</option>
                <option value="leads">🟣 Příležitosti</option>
                <option value="prep">🔵 Příprava</option>
                <option value="purchase">🟠 Nákup</option>
                <option value="execution">🟢 Realizace</option>
                <option value="revision">🟡 Revize</option>
                <option value="distribution">🔷 Distribuce</option>
                <option value="service">🟦 Servis</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">Žádné projekty</p>
                </div>
              ) : (
                filteredProjects.map(project => {
                  const statusInfo = STATUS_LABELS[project.status] || { cs: project.status, icon: Wrench, bgColor: 'bg-gray-50', borderColor: 'border-gray-300', textColor: 'text-gray-700' }
                  const StatusIcon = statusInfo.icon
                  return (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, project)}
                      className={`w-full text-left rounded-2xl transition-all duration-200 cursor-move ${
                        selectedProjectId === project.id
                          ? 'glass shadow-xl border border-green-200 bg-white'
                          : 'glass-sm hover:glass border border-gray-100'
                      } ${draggedProject?.id === project.id ? 'opacity-50' : ''}`}
                    >
                      <div className="px-4 lg:px-5 py-3 lg:py-4 space-y-2.5 lg:space-y-3.5">
                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium border ${statusInfo.bgColor} ${statusInfo.borderColor} ${statusInfo.textColor} w-fit`}>
                          <StatusIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                          <span>{statusInfo.cs}</span>
                        </div>

                        {/* Title & Customer */}
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-snug">{project.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">{project.customer}</p>
                        </div>

                        {/* Tags */}
                        {(project.tags || []).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {project.tags.map(tag => (
                              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Obrat</p>
                            <p className="text-sm font-semibold text-green-600">{(project.revenue / 1000000).toFixed(2)}M</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Úkoly</p>
                            <p className="text-sm font-semibold text-blue-600">{(project.tasks || []).length}</p>
                          </div>
                          {selectedProjectId === project.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteProject(project.id)
                              }}
                              className="ml-auto p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Smazat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Pravá část: Detail projektu (mobile: full width, desktop: 3 cols) */}
          <div className="lg:col-span-3">
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
