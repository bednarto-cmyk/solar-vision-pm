import type { Project } from '../store/projectStore'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div className="card p-4 bg-white">
      <h4 className="font-semibold text-gray-800 text-sm mb-2">{project.name}</h4>
      <p className="text-xs text-gray-600 mb-3">{project.customer}</p>

      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Výkon:</span>
          <span className="font-semibold">{project.power} kWp</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Výnos:</span>
          <span className="font-semibold text-green-600">{project.revenue}</span>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onEdit(project)}
          className="btn-secondary flex-1 text-xs"
        >
          Editovat
        </button>
        <button
          onClick={() => onDelete(project.id)}
          className="btn-secondary flex-1 text-xs text-red-600"
        >
          Smazat
        </button>
      </div>
    </div>
  )
}
