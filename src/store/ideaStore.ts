import { create } from 'zustand'
import { db } from '../config/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore'

export interface Idea {
  id: string
  title: string
  description: string
  status: 'new' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  parentId?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface IdeaStore {
  ideas: Idea[]
  initialized: boolean
  initializeIdeas: () => () => void
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>, createdBy: string) => Promise<void>
  updateIdea: (id: string, updates: Partial<Idea>) => Promise<void>
  deleteIdea: (id: string) => Promise<void>
}

export const useFirebaseIdeaStore = create<IdeaStore>((set, get) => ({
  ideas: [],
  initialized: false,

  initializeIdeas: () => {
    if (get().initialized) {
      console.log('Ideas already initialized')
      return () => {}
    }

    console.log('Initializing ideas from Firebase...')
    const ideasRef = collection(db, 'ideas')
    const q = query(ideasRef)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ideasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Idea[]

      console.log('Ideas loaded from Firebase:', ideasData)
      set({ ideas: ideasData, initialized: true })
    }, (error) => {
      console.error('Error loading ideas:', error)
    })

    return unsubscribe
  },

  addIdea: async (idea, createdBy) => {
    try {
      const ideasRef = collection(db, 'ideas')
      const newIdea = {
        ...idea,
        createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      console.log('Adding idea to Firebase:', newIdea)
      const docRef = await addDoc(ideasRef, newIdea)
      console.log('Idea added with ID:', docRef.id)
    } catch (error) {
      console.error('Error adding idea:', error)
      throw error
    }
  },

  updateIdea: async (id, updates) => {
    try {
      const ideaRef = doc(db, 'ideas', id)
      await updateDoc(ideaRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error updating idea:', error)
      throw error
    }
  },

  deleteIdea: async (id) => {
    try {
      const ideaRef = doc(db, 'ideas', id)
      await deleteDoc(ideaRef)
    } catch (error) {
      console.error('Error deleting idea:', error)
      throw error
    }
  },
}))
