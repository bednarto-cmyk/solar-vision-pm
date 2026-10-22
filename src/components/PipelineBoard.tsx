import { useState } from 'react'
import { AlertTriangle, CheckSquare } from 'lucide-react'
import type { Project } from '../types'
import type { PipelineKey } from '../utils/pipeline'
import {
  PIPELINE_COLUMNS,
  columnKeyOf,
  formatCzk,
  initials,
  isOverdue,
  weightedValue,
  formatDate,
} from '../utils/pipeline'

interface PipelineBoardProps {
  projects: Project[]
  userNames: Record<string, string>
  onOpen: (project: Project) => void
  onMove: (project: Project, target: PipelineKey) => void
}

const sum = (items: Project[], pick: (p: Project) => number) => items.reduce((total, p) => total + pick(p), 0)

export default function PipelineBoard({ projects, userNames, onOpen, onMove }: PipelineBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [overKey, setOverKey] = useState<PipelineKey | null>(null)

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
      {PIPELINE_COLUMNS.map(column => {
        const items = projects.filter(p => columnKeyOf(p) === column.key)
        const isOver = overKey === column.key

        return (
          <section
            key={column.key}
            onDragOver={event => {
              event.preventDefault()
              setOverKey(column.key)
            }}
            onDragLeave={() => setOverKey(current => (current === column.key ? null : current))}
            onDrop={event => {
              event.preventDefault()
              const project = projects.find(p => p.id === draggedId)
              setOverKey(null)
              setDraggedId(null)
              if (project) onMove(project, column.key)
            }}
            className={`shrink-0 w-72 flex flex-col rounded-2xl border transition-colors ${
              isOver ? 'border-emerald-400 bg-emerald-50/60' : 'border-gray-200 bg-gray-100/70'
            }`}
          >
            <header className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${column.dot}`} />
                  <h3 className="text-sm font-semibold text-gray-800">{column.label}</h3>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                  {items.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1.5 tabular">
                {formatCzk(sum(items, p => p.revenue))}
                <span className="text-gray-400"> · vážené {formatCzk(sum(items, weightedValue))}</span>
              </p>
            </header>

            <div className="flex-1 px-3 pb-3 space-y-2.5 min-h-[160px]">
              {items.map(project => {
                const done = project.tasks?.filter(t => t.completed).length ?? 0
                const total = project.tasks?.length ?? 0
                const overdue = isOverdue(project)
                const ownerName = userNames[project.assignedTo] ?? '—'

                return (
                  <article
                    key={project.id}
                    draggable
                    onDragStart={event => {
                      setDraggedId(project.id)
                      event.dataTransfer.setData('text/plain', project.id)
                      event.dataTransfer.effectAllowed = 'move'
                    }}
                    onDragEnd={() => setDraggedId(null)}
                    onClick={() => onOpen(project)}
                    className={`bg-white rounded-xl border p-3.5 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-shadow ${
                      draggedId === project.id ? 'opacity-50' : ''
                    } ${overdue ? 'border-red-200' : 'border-gray-200'}`}
                  >
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{project.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{project.customer}</p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-semibold text-gray-900 tabular">{formatCzk(project.revenue)}</span>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 rounded-md px-1.5 py-0.5 tabular">
                        {project.successProbability ?? 0} %
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : ''}`}>
                        {overdue && <AlertTriangle className="w-3.5 h-3.5" />}
                        {formatDate(project.endDate)}
                      </span>
                      <div className="flex items-center gap-2">
                        {total > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5" />
                            {done}/{total}
                          </span>
                        )}
                        <span
                          title={ownerName}
                          className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-[10px] font-semibold flex items-center justify-center"
                        >
                          {initials(ownerName)}
                        </span>
                      </div>
                    </div>
                  </article>
                )
              })}

              {items.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-8">Přetáhni sem příležitost</p>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

