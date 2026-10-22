import type { OfferPhase, Project } from '../types'

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

export type PipelineKey = 'created' | 'sent' | 'negotiation' | 'postponed' | 'accepted' | 'lost'

export const PIPELINE_COLUMNS: { key: PipelineKey; label: string; phases: OfferPhase[]; dot: string }[] = [
  { key: 'created', label: 'Vytvořená', phases: ['created'], dot: 'bg-slate-400' },
  { key: 'sent', label: 'Předaná', phases: ['sent'], dot: 'bg-sky-500' },
  { key: 'negotiation', label: 'Jednání o SoD', phases: ['negotiation'], dot: 'bg-amber-500' },
  { key: 'postponed', label: 'Odloženo', phases: ['postponed'], dot: 'bg-violet-400' },
  { key: 'accepted', label: 'Akceptovaná', phases: ['accepted'], dot: 'bg-emerald-500' },
  {
    key: 'lost',
    label: 'Ztraceno',
    phases: ['cancelled_cheaper', 'cancelled_better', 'cancelled_expensive'],
    dot: 'bg-red-500',
  },
]

export const columnKeyOf = (p: Project): PipelineKey =>
  PIPELINE_COLUMNS.find(c => c.phases.includes(offerPhaseOf(p)))?.key ?? 'created'

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('cs-CZ')

export const isOverdue = (p: Project) => isOpen(p) && !p.isUrgentAcknowledged && daysUntil(p.endDate) < 0
