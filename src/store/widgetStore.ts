import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WidgetType = 'total_projects' | 'total_revenue' | 'total_profit' | 'profit_margin' | 'team_performance' | 'projects_by_status' | 'financial_overview'

export interface Widget {
  id: string
  type: WidgetType
  label: string
  enabled: boolean
  order: number
}

interface WidgetStore {
  widgets: Widget[]
  addWidget: (widget: Widget) => void
  removeWidget: (id: string) => void
  toggleWidget: (id: string) => void
  reorderWidgets: (widgets: Widget[]) => void
  resetWidgets: () => void
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: 'w1', type: 'total_projects', label: 'Počet projektů', enabled: true, order: 1 },
  { id: 'w2', type: 'total_revenue', label: 'Celkový výnos', enabled: true, order: 2 },
  { id: 'w3', type: 'total_profit', label: 'Celkový zisk', enabled: true, order: 3 },
  { id: 'w4', type: 'profit_margin', label: 'Zisková marže', enabled: true, order: 4 },
  { id: 'w5', type: 'team_performance', label: 'Výkon týmu', enabled: true, order: 5 },
  { id: 'w6', type: 'projects_by_status', label: 'Projekty dle stavu', enabled: true, order: 6 },
  { id: 'w7', type: 'financial_overview', label: 'Finanční přehled', enabled: true, order: 7 },
]

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set) => ({
      widgets: DEFAULT_WIDGETS,
      addWidget: (widget) =>
        set((state) => ({
          widgets: [...state.widgets, widget],
        })),
      removeWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        })),
      toggleWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, enabled: !w.enabled } : w
          ),
        })),
      reorderWidgets: (widgets) => set({ widgets }),
      resetWidgets: () => set({ widgets: DEFAULT_WIDGETS }),
    }),
    {
      name: 'solar-vision-widgets',
    }
  )
)
