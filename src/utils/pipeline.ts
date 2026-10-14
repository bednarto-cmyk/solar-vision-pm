import type { OfferPhase, Project } from '../store/projectStore'

export const OFFER_LABELS: Record<OfferPhase, string> = {
  created: 'Vytvořená',
  sent: 'Předaná',
  negotiation: 'Jednání o SoD',
  postponed: 'Odloženo',
  accepted: 'Akceptovaná',
  cancelled_cheaper: 'Storno – levnější konkurence',
  cancelled_better: 'Storno – lepší konkurence',
  cancelled_expensive: 'Storno – příliš drahá nabídka',
}

export const offerPhaseOf = (p: Project): OfferPhase => p.offerPhase ?? 'created'
export const isWon = (p: Project) => offerPhaseOf(p) === 'accepted'
export const isLost = (p: Project) => offerPhaseOf(p).startsWith('cancelled_')
export const isOpen = (p: Project) => !isWon(p) && !isLost(p)
export const weightedValue = (p: Project) => (p.revenue || 0) * ((p.successProbability ?? 0) / 100)

export const opportunitiesFor = (projects: Project[], user: any) =>
  projects.filter(p => p.status === 'leads' && (user.role === 'admin' || p.assignedTo === user.id))

export const formatCzk = (value: number) =>
  value.toLocaleString('cs-CZ', { maximumFractionDigits: 0 }) + ' Kč'

export const daysUntil = (dateStr: string) =>
  Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
