import { X } from 'lucide-react'

interface ContactHistoryModalProps {
  contact: any
  onClose: () => void
}

export default function ContactHistoryModal({ contact, onClose }: ContactHistoryModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created':
        return 'Přidáno'
      case 'updated':
        return 'Aktualizováno'
      case 'deleted':
        return 'Smazáno'
      default:
        return action
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-700'
      case 'updated':
        return 'bg-blue-100 text-blue-700'
      case 'deleted':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Historie Kontaktu</h2>
            <p className="text-sm text-gray-600 mt-1">{contact.name} - {contact.company}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto space-y-4">
          {contact.history && contact.history.length > 0 ? (
            contact.history.map((entry: any, idx: number) => (
              <div key={idx} className="border-l-4 border-gray-300 pl-4 py-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(entry.action)}`}>
                        {getActionLabel(entry.action)}
                      </span>
                      <span className="text-sm text-gray-600">{formatDate(entry.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>{entry.changedBy}</strong>
                    </p>

                    {entry.changes && entry.changes.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        {entry.changes.map((change: any, cidx: number) => (
                          <div key={cidx} className="mb-1">
                            <strong>{change.field}:</strong> "{change.oldValue}" → "{change.newValue}"
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              Žádná historie
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  )
}
