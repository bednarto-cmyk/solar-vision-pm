export type ProjectStatus = 'leads' | 'prep' | 'purchase' | 'execution' | 'revision' | 'distribution' | 'service' | 'completed'
export type OfferPhase = 'created' | 'sent' | 'accepted' | 'negotiation' | 'postponed' | 'cancelled_cheaper' | 'cancelled_better' | 'cancelled_expensive'

export interface ProjectTask {
  id: string
  title: string
  completed: boolean
  status?: ProjectStatus
}

export interface Project {
  id: string
  name: string
  customer: string
  status: ProjectStatus
  assignedTo: string
  contactId?: string
  power: number
  cost: number
  revenue: number
  startDate: string
  endDate: string
  phases: { [key: string]: boolean }
  documents: string[]
  tasks: ProjectTask[]
  tags: string[]
  notes: string
  isUrgentAcknowledged?: boolean
  createdAt: string
  offerPhase?: OfferPhase
  successProbability?: number
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
  annualRevenue?: number
  quarterlyTargets?: { q1: number; q2: number; q3: number; q4: number }
}

export type ContactType = 'vedení' | 'nákupčí' | 'rozhodovatel' | 'koncový zákazník' | 'jiné'

export interface Contact {
  id: string
  name: string
  company: string
  email: string
  phone: string
  type: ContactType
  assignedTo: string
  notes: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  ico?: string
  dic?: string
  address?: string
}
