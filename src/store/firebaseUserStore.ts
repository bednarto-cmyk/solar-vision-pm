import { create } from 'zustand'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { User } from './userStore'

interface UserStore {
  users: User[]
  initialized: boolean
  initializeUsers: () => void
  addUser: (user: Omit<User, 'id'>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  updateUser: (id: string, updates: Partial<User>) => Promise<void>
}

export const useFirebaseUserStore = create<UserStore>((set, get) => ({
  users: [],
  initialized: false,
  initializeUsers: () => {
    if (get().initialized) return

    const usersRef = collection(db, 'users')
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const users: User[] = []
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as User)
      })
      set({ users, initialized: true })
    })

    return unsubscribe
  },
  addUser: async (user) => {
    const usersRef = collection(db, 'users')
    await addDoc(usersRef, user)
  },
  deleteUser: async (id) => {
    const userRef = doc(db, 'users', id)
    await deleteDoc(userRef)
  },
  updateUser: async (id, updates) => {
    const userRef = doc(db, 'users', id)
    await updateDoc(userRef, updates)
  },
}))
