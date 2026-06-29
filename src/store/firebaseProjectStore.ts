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
import type { Project, ProjectStatus } from './projectStore'

interface ProjectStore {
  projects: Project[]
  initialized: boolean
  initializeProjects: () => void
  addProject: (project: Omit<Project, 'id'>) => Promise<void>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  moveProject: (id: string, newStatus: ProjectStatus) => Promise<void>
  getProjectsByStatus: (status: ProjectStatus) => Project[]
  addTask: (projectId: string, taskTitle: string) => Promise<void>
  updateTask: (projectId: string, taskId: string, completed: boolean) => Promise<void>
  deleteTask: (projectId: string, taskId: string) => Promise<void>
  acknowledgeUrgent: (id: string) => Promise<void>
}

export const useFirebaseProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  initialized: false,
  initializeProjects: () => {
    if (get().initialized) return

    const projectsRef = collection(db, 'projects')
    const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
      const projects: Project[] = []
      snapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() } as Project)
      })
      set({ projects, initialized: true })
    })

    return unsubscribe
  },
  addProject: async (project) => {
    const projectsRef = collection(db, 'projects')
    await addDoc(projectsRef, project)
  },
  updateProject: async (id, updates) => {
    const projectRef = doc(db, 'projects', id)
    await updateDoc(projectRef, updates)
  },
  deleteProject: async (id) => {
    const projectRef = doc(db, 'projects', id)
    await deleteDoc(projectRef)
  },
  moveProject: async (id, newStatus) => {
    const projectRef = doc(db, 'projects', id)
    await updateDoc(projectRef, { status: newStatus })
  },
  getProjectsByStatus: (status) => {
    const state = get()
    return state.projects.filter((p) => p.status === status)
  },
  addTask: async (projectId, taskTitle) => {
    const projectRef = doc(db, 'projects', projectId)
    const project = get().projects.find((p) => p.id === projectId)
    if (project) {
      const newTask = {
        id: `task-${Date.now()}`,
        title: taskTitle,
        completed: false,
      }
      await updateDoc(projectRef, {
        tasks: [...(project.tasks || []), newTask],
      })
    }
  },
  updateTask: async (projectId, taskId, completed) => {
    const projectRef = doc(db, 'projects', projectId)
    const project = get().projects.find((p) => p.id === projectId)
    if (project) {
      await updateDoc(projectRef, {
        tasks: (project.tasks || []).map((t) =>
          t.id === taskId ? { ...t, completed } : t
        ),
      })
    }
  },
  deleteTask: async (projectId, taskId) => {
    const projectRef = doc(db, 'projects', projectId)
    const project = get().projects.find((p) => p.id === projectId)
    if (project) {
      await updateDoc(projectRef, {
        tasks: (project.tasks || []).filter((t) => t.id !== taskId),
      })
    }
  },
  acknowledgeUrgent: async (id) => {
    const projectRef = doc(db, 'projects', id)
    await updateDoc(projectRef, { isUrgentAcknowledged: true })
  },
}))
