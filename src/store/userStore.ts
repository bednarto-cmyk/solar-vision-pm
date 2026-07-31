import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
  annualRevenue?: number
  quarterlyTargets?: {
    q1: number
    q2: number
    q3: number
    q4: number
  }
}

interface UserStore {
  users: User[]
  addUser: (user: User) => void
  deleteUser: (id: string) => void
  updateUser: (id: string, user: Partial<User>) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      users: [
        {
          id: '1',
          name: 'Tomáš Michal',
          email: 'tomas.michal@solarvision.cz',
          role: 'admin',
          createdAt: new Date().toISOString(),
          annualRevenue: 5000000,
          quarterlyTargets: {
            q1: 1250000,
            q2: 1250000,
            q3: 1250000,
            q4: 1250000,
          },
        },
        {
          id: '2',
          name: 'Tomáš Bednář',
          email: 'tomas.bednar@solarvision.cz',
          role: 'user',
          createdAt: new Date().toISOString(),
          annualRevenue: 3000000,
          quarterlyTargets: {
            q1: 750000,
            q2: 750000,
            q3: 750000,
            q4: 750000,
          },
        },
      ],
      addUser: (user) =>
        set((state) => ({
          users: [...state.users, user],
        })),
      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        })),
      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        })),
    }),
    {
      name: 'solar-vision-users-v5',
    }
  )
)
