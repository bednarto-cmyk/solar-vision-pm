import { Trash2, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface DraggableTaskCardProps {
  id: string
  task: any
  onDelete: () => void
}

export default function DraggableTaskCard({ id, task, onDelete }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all ${
        isDragging ? 'ring-2 ring-green-500 shadow-lg' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-3">
        <GripVertical className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-200">{task.title}</p>
        </div>
        <button
          onClick={onDelete}
          className="p-1 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
