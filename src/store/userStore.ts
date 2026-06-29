import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
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
          name: 'Jan Novák',
          email: 'jan.novotny@solarvision.cz',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Petr Svoboda',
          email: 'petr.svoboda@solarvision.cz',
          role: 'user',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Marie Kučerová',
          email: 'marie.kucerova@solarvision.cz',
          role: 'user',
          createdAt: new Date().toISOString(),
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
      name: 'solar-vision-users',
    }
  )
)
