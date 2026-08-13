import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight, Lightbulb } from 'lucide-react'
import { useFirebaseIdeaStore } from '../store/ideaStore'
import { useUserStore } from '../store/userStore'
import toast from 'react-hot-toast'

interface IdeaFormData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  parentId?: string
}

export default function IdeasView({ user }: { user: any }) {
  const { ideas, addIdea, updateIdea, deleteIdea, initializeIdeas } = useFirebaseIdeaStore()
  const { users } = useUserStore()

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<IdeaFormData>({
    title: '',
    description: '',
    priority: 'medium',
  })
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>()

  useEffect(() => {
    console.log('IdeasView mounted, initializing ideas...')
    const unsubscribe = initializeIdeas()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  useEffect(() => {
    console.log('IdeasView ideas changed:', ideas)
  }, [ideas])

  const getCreatorName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || userId
  }

  const getIdeaChildren = (ideaId: string) => {
    return ideas.filter(idea => idea.parentId === ideaId)
  }

  const handleAddIdea = async () => {
    if (!formData.title.trim()) {
      toast.error('Vyplň název nápadu')
      return
    }

    try {
      const newIdea: any = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: 'new',
      }
      if (selectedParentId) {
        newIdea.parentId = selectedParentId
      }
      await addIdea(newIdea, user.name)
      toast.success('Nápad přidán')
      setFormData({ title: '', description: '', priority: 'medium' })
      setShowForm(false)
      setSelectedParentId(undefined)
    } catch (error) {
      toast.error('Chyba při přidávání nápadu')
    }
  }

  const handleStatusChange = async (ideaId: string, newStatus: string) => {
    try {
      await updateIdea(ideaId, { status: newStatus as any })
      toast.success('Nápad aktualizován')
    } catch (error) {
      toast.error('Chyba při aktualizaci')
    }
  }

  const handleDeleteIdea = async (ideaId: string) => {
    if (window.confirm('Opravdu chceš smazat tento nápad?')) {
      try {
        // Smaž i všechny podřízené nápady
        const childrenToDelete = getIdeaChildren(ideaId)
        for (const child of childrenToDelete) {
          await deleteIdea(child.id)
        }
        await deleteIdea(ideaId)
        toast.success('Nápad smazán')
      } catch (error) {
        toast.error('Chyba při mazání')
      }
    }
  }

  const toggleExpand = (ideaId: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(ideaId)) {
      newExpanded.delete(ideaId)
    } else {
      newExpanded.add(ideaId)
    }
    setExpandedIds(newExpanded)
  }

  // Jen top-level nápady, bez filtrování
  const filteredIdeas = ideas.filter(idea => !idea.parentId)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    const labels: { [key: string]: string } = {
      low: 'Nízká',
      medium: 'Střední',
      high: 'Vysoká',
    }
    return labels[priority] || priority
  }

  const renderIdeaTree = (parentId: string | undefined = undefined, depth = 0) => {
    const children = ideas.filter(idea => idea.parentId === parentId)

    return (
      <div className={depth > 0 ? 'ml-6 space-y-3 mt-3' : 'space-y-3'}>
        {children.map(idea => {
          const hasChildren = getIdeaChildren(idea.id).length > 0
          const isExpanded = expandedIds.has(idea.id)

          return (
            <div key={idea.id} className={`border-l-2 border-gray-300 pl-4 ${idea.status === 'completed' ? 'opacity-50' : ''}`}>
              <div className={`bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow ${idea.status === 'completed' ? 'bg-gray-50' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {hasChildren && (
                        <button
                          onClick={() => toggleExpand(idea.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      )}
                      {!hasChildren && <div className="w-4" />}
                      <h3 className="font-semibold text-gray-900">{idea.title}</h3>
                    </div>

                    {idea.description && (
                      <p className="text-sm text-gray-600 mb-2">{idea.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(idea.priority)}`}>
                        {getPriorityLabel(idea.priority)}
                      </span>
                      <select
                        value={idea.status}
                        onChange={(e) => handleStatusChange(idea.id, e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded cursor-pointer"
                      >
                        <option value="new">Nový</option>
                        <option value="in_progress">V řešení</option>
                        <option value="completed">Vyřešeno</option>
                      </select>
                      <span className="text-xs text-gray-500">
                        od {getCreatorName(idea.createdBy)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedParentId(idea.id)
                        setShowForm(true)
                      }}
                      className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                      title="Přidat podmyšlenku"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && hasChildren && renderIdeaTree(idea.id, depth + 1)}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 min-h-screen pb-24">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
              Nápady na zlepšení
            </h1>
            <p className="text-gray-600 mt-1">Sdílej myšlenky pro rozvoj firmy, které mohou ostatní rozvinout</p>
          </div>
          <button
            onClick={() => {
              setSelectedParentId(undefined)
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors w-fit"
          >
            <Plus className="w-5 h-5" />
            Nový Nápad
          </button>
        </div>

        {/* Nový nápad formulář */}
        {showForm && (
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {selectedParentId ? 'Přidat podmyšlenku' : 'Přidat nový nápad'}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Název nápadu..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Popis (volitelně)..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAddIdea}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Přidat
                </button>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setSelectedParentId(undefined)
                    setFormData({ title: '', description: '', priority: 'medium' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Zrušit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Seznam nápadů */}
        <div>
          {filteredIdeas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Žádné nápady zatím... Buď ten první! 💡</p>
            </div>
          ) : (
            renderIdeaTree()
          )}
        </div>
      </div>
    </div>
  )
}
