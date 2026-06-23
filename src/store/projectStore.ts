import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ProjectStatus = 'leads' | 'prep' | 'purchase' | 'execution' | 'revision' | 'distribution' | 'service'

export interface Project {
  id: string
  name: string
  customer: string
  status: ProjectStatus
  assignedTo: string
  power: number // kWp
  cost: number
  revenue: number
  startDate: string
  endDate: string
  phases: {
    [key: string]: boolean
  }
  documents: string[]
  notes: string
  createdAt: string
}

interface ProjectStore {
  projects: Project[]
  addProject: (project: Project) => void
  updateProject: (id: string, project: Partial<Project>) => void
  deleteProject: (id: string) => void
  moveProject: (id: string, newStatus: ProjectStatus) => void
  getProjectsByUser: (userId: string) => Project[]
  getProjectsByStatus: (status: ProjectStatus) => Project[]
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [
        // LEADS
        {
          id: '1',
          name: 'Panely na střechu - rodina Novotná',
          customer: 'Jan Novotný',
          status: 'leads',
          assignedTo: '1',
          power: 10,
          cost: 250000,
          revenue: 350000,
          startDate: '2026-06-24',
          endDate: '2026-07-24',
          phases: {},
          documents: [],
          notes: 'Zájemce z webového formuláře',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Výměna střechy + solární - Kovářová',
          customer: 'Jana Kovářová',
          status: 'leads',
          assignedTo: '3',
          power: 8,
          cost: 200000,
          revenue: 300000,
          startDate: '2026-07-01',
          endDate: '2026-08-15',
          phases: {},
          documents: [],
          notes: 'Zajímavá klientka, druhý kontakt za týden',
          createdAt: new Date().toISOString(),
        },
        // PREP
        {
          id: '2',
          name: 'Komerční systém - BOZP s.r.o.',
          customer: 'BOZP s.r.o.',
          status: 'prep',
          assignedTo: '2',
          power: 50,
          cost: 1200000,
          revenue: 1600000,
          startDate: '2026-05-01',
          endDate: '2026-08-01',
          phases: {},
          documents: [],
          notes: 'Připojení na 3×400V',
          createdAt: new Date().toISOString(),
        },
        // PURCHASE
        {
          id: '4',
          name: 'Průmysl - Automechanika Švadlena',
          customer: 'Automechanika Švadlena',
          status: 'purchase',
          assignedTo: '1',
          power: 30,
          cost: 750000,
          revenue: 1050000,
          startDate: '2026-06-15',
          endDate: '2026-09-15',
          phases: {},
          documents: [],
          notes: 'Výběrové řízení probíhá',
          createdAt: new Date().toISOString(),
        },
        // EXECUTION
        {
          id: '5',
          name: 'Chata na Moravě - Pavlíčka',
          customer: 'Pavel Pavlíčka',
          status: 'execution',
          assignedTo: '2',
          power: 12,
          cost: 300000,
          revenue: 420000,
          startDate: '2026-05-15',
          endDate: '2026-07-15',
          phases: {},
          documents: [],
          notes: 'Montáž probíhá, pokládka kabelů',
          createdAt: new Date().toISOString(),
        },
        // REVISION
        {
          id: '6',
          name: 'Garáž + dílna - Holubář',
          customer: 'Milan Holubář',
          status: 'revision',
          assignedTo: '3',
          power: 5,
          cost: 125000,
          revenue: 175000,
          startDate: '2026-04-01',
          endDate: '2026-06-30',
          phases: {},
          documents: [],
          notes: 'Probíhá finální kontrola',
          createdAt: new Date().toISOString(),
        },
        // DISTRIBUTION
        {
          id: '7',
          name: 'Restaurace u Třech Lípů',
          customer: 'Restaurace u Třech Lípů',
          status: 'distribution',
          assignedTo: '1',
          power: 15,
          cost: 375000,
          revenue: 525000,
          startDate: '2026-03-01',
          endDate: '2026-06-15',
          phases: {},
          documents: [],
          notes: 'Čeká na schválení UTP',
          createdAt: new Date().toISOString(),
        },
        // SERVICE
        {
          id: '8',
          name: 'Rodinný dům - Novotná (servis)',
          customer: 'Eva Novotná',
          status: 'service',
          assignedTo: '2',
          power: 6,
          cost: 150000,
          revenue: 210000,
          startDate: '2026-01-15',
          endDate: '2026-05-15',
          phases: {},
          documents: [],
          notes: 'Instalace hotova, 2. rok záruky',
          createdAt: new Date().toISOString(),
        },
      ],
      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
        })),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),
      moveProject: (id, newStatus) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, status: newStatus } : p
          ),
        })),
      getProjectsByUser: (userId) => {
        const state = get()
        return state.projects.filter((p) => p.assignedTo === userId)
      },
      getProjectsByStatus: (status) => {
        const state = get()
        return state.projects.filter((p) => p.status === status)
      },
    }),
    {
      name: 'solar-vision-projects',
    }
  )
)
