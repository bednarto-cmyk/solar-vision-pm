import { create } from 'zustand'
import { db } from '../config/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore'

export interface Contact {
  id: string
  name: string
  company: string
  email: string
  phone: string
  type: 'vedení' | 'nákupčí' | 'rozhodovatel' | 'koncový zákazník' | 'jiné'
  assignedTo: string
  notes: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

interface ContactStore {
  contacts: Contact[]
  initializeContacts: () => void
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>, createdBy: string) => Promise<void>
  updateContact: (id: string, updates: Partial<Contact>, updatedBy: string) => Promise<void>
  deleteContact: (id: string) => Promise<void>
}

export const useFirebaseContactStore = create<ContactStore>((set) => ({
  contacts: [],

  initializeContacts: () => {
    const contactsRef = collection(db, 'contacts')
    const q = query(contactsRef)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contactsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[]

      set({ contacts: contactsData })
    }, (error) => {
      console.error('Error loading contacts:', error)
    })

    return unsubscribe
  },

  addContact: async (contact, createdBy) => {
    try {
      const contactsRef = collection(db, 'contacts')
      const newContact = {
        ...contact,
        createdAt: new Date().toISOString(),
        createdBy,
        updatedAt: new Date().toISOString(),
        updatedBy: createdBy,
      }

      await addDoc(contactsRef, newContact)
    } catch (error) {
      console.error('Error adding contact:', error)
      throw error
    }
  },

  updateContact: async (id, updates, updatedBy) => {
    try {
      const contactRef = doc(db, 'contacts', id)
      await updateDoc(contactRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy,
      })
    } catch (error) {
      console.error('Error updating contact:', error)
      throw error
    }
  },

  deleteContact: async (id) => {
    try {
      const contactRef = doc(db, 'contacts', id)
      await deleteDoc(contactRef)
    } catch (error) {
      console.error('Error deleting contact:', error)
      throw error
    }
  },
}))
