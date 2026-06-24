import { create } from 'zustand'

export interface ContactHistory {
  id: string
  action: 'created' | 'updated' | 'deleted'
  timestamp: string
  changedBy: string
  changes?: {
    field: string
    oldValue: string
    newValue: string
  }[]
}

export interface Contact {
  id: string
  name: string
  company: string
  email: string
  phone: string
  type: 'vedení' | 'nákupčí' | 'rozhodovatel' | 'jiné'
  assignedTo: string // userId (Jan/Petr/Marie)
  notes: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  history: ContactHistory[]
}

interface ContactStore {
  contacts: Contact[]
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'history'>, createdBy: string) => void
  updateContact: (id: string, contact: Partial<Contact>, updatedBy: string) => void
  deleteContact: (id: string, deletedBy: string) => void
  getContactsByObchodnik: (obchodnikId: string) => Contact[]
  getAllContacts: () => Contact[]
  getContactRevenue: (contactId: string, projects: any[]) => number
}

const DEMO_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Ing. Jiří Kovács',
    company: 'ABC Stavby s.r.o.',
    email: 'jiri.kovacs@abcstavby.cz',
    phone: '+420 724 123 456',
    type: 'vedení',
    assignedTo: '1', // Jan
    notes: 'Vedoucí oddělení staveb, rozhoduje o velkých investicích',
    createdAt: '2026-01-15T10:30:00Z',
    createdBy: 'admin',
    updatedAt: '2026-01-15T10:30:00Z',
    updatedBy: 'admin',
    history: [
      {
        id: 'h1',
        action: 'created',
        timestamp: '2026-01-15T10:30:00Z',
        changedBy: 'admin',
      }
    ]
  },
  {
    id: '2',
    name: 'Mgr. Eva Svobodová',
    company: 'Průmysl & Co',
    email: 'eva.svobodova@prumysl.cz',
    phone: '+420 735 654 321',
    type: 'nákupčí',
    assignedTo: '1', // Jan
    notes: 'Zodpovídá za nákup energetických řešení',
    createdAt: '2026-01-20T14:00:00Z',
    createdBy: 'admin',
    updatedAt: '2026-01-20T14:00:00Z',
    updatedBy: 'admin',
    history: [
      {
        id: 'h2',
        action: 'created',
        timestamp: '2026-01-20T14:00:00Z',
        changedBy: 'admin',
      }
    ]
  },
  {
    id: '3',
    name: 'Petr Novotný',
    company: 'TechnoSolar GmbH',
    email: 'petr.novotny@technosolar.de',
    phone: '+420 733 222 333',
    type: 'rozhodovatel',
    assignedTo: '2', // Petr
    notes: 'CEO, finální schvaluje všechny projekty',
    createdAt: '2026-02-01T09:15:00Z',
    createdBy: 'admin',
    updatedAt: '2026-02-01T09:15:00Z',
    updatedBy: 'admin',
    history: [
      {
        id: 'h3',
        action: 'created',
        timestamp: '2026-02-01T09:15:00Z',
        changedBy: 'admin',
      }
    ]
  },
  {
    id: '4',
    name: 'Ing. Lucie Čermáková',
    company: 'GreenEnergy CZ',
    email: 'lucie.cermakova@greenenergy.cz',
    phone: '+420 722 111 444',
    type: 'nákupčí',
    assignedTo: '3', // Marie
    notes: 'Řídí energetický tým, hledá efektivní řešení',
    createdAt: '2026-02-05T11:45:00Z',
    createdBy: 'admin',
    updatedAt: '2026-02-05T11:45:00Z',
    updatedBy: 'admin',
    history: [
      {
        id: 'h4',
        action: 'created',
        timestamp: '2026-02-05T11:45:00Z',
        changedBy: 'admin',
      }
    ]
  },
]

export const useContactStore = create<ContactStore>((set, get) => ({
  contacts: DEMO_CONTACTS,

  addContact: (contact, createdBy) => {
    const newContact: Contact = {
      ...contact,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      createdBy,
      updatedAt: new Date().toISOString(),
      updatedBy: createdBy,
      history: [
        {
          id: `h${Date.now()}`,
          action: 'created',
          timestamp: new Date().toISOString(),
          changedBy: createdBy,
        }
      ]
    }
    set(state => ({ contacts: [...state.contacts, newContact] }))
  },

  updateContact: (id, updates, updatedBy) => {
    set(state => ({
      contacts: state.contacts.map(contact => {
        if (contact.id === id) {
          const changes = Object.entries(updates)
            .filter(([key]) => key !== 'id' && key !== 'history' && key !== 'createdAt' && key !== 'createdBy')
            .map(([field, newValue]) => ({
              field,
              oldValue: String(contact[field as keyof Contact] || ''),
              newValue: String(newValue || ''),
            }))

          return {
            ...contact,
            ...updates,
            updatedAt: new Date().toISOString(),
            updatedBy,
            history: [
              ...contact.history,
              {
                id: `h${Date.now()}`,
                action: 'updated',
                timestamp: new Date().toISOString(),
                changedBy: updatedBy,
                changes: changes.length > 0 ? changes : undefined,
              }
            ]
          }
        }
        return contact
      })
    }))
  },

  deleteContact: (id, deletedBy) => {
    set(state => {
      const updated = state.contacts.map(contact => {
        if (contact.id === id) {
          return {
            ...contact,
            history: [
              ...contact.history,
              {
                id: `h${Date.now()}`,
                action: 'deleted' as const,
                timestamp: new Date().toISOString(),
                changedBy: deletedBy,
              }
            ]
          }
        }
        return contact
      }).filter(c => !c.history.some(h => h.action === 'deleted'))

      return { contacts: updated }
    })
  },

  getContactsByObchodnik: (obchodnikId) => {
    return get().contacts.filter(c => c.assignedTo === obchodnikId)
  },

  getAllContacts: () => {
    return get().contacts
  },

  getContactRevenue: (contactId, projects) => {
    return projects
      .filter(p => p.contactId === contactId)
      .reduce((sum, p) => sum + (p.revenue || 0), 0)
  }
}))
