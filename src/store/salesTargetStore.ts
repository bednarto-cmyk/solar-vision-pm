import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SalesTarget {
  userId: string
  yearlyTarget: number // Roční plán (Kč)
  monthlyBreakdown: Record<string, number> // Plán na jednotlivé měsíce
}

interface SalesTargetStore {
  targets: SalesTarget[]
  setSalesTarget: (userId: string, target: SalesTarget) => void
  getSalesTarget: (userId: string) => SalesTarget | undefined
  getAllTargets: () => SalesTarget[]
  getMonthlyTarget: (userId: string, month: number) => number
}

const DEFAULT_TARGETS: SalesTarget[] = [
  {
    userId: '1',
    yearlyTarget: 5000000, // 5M Kč roční plán
    monthlyBreakdown: {
      '1': 350000,
      '2': 350000,
      '3': 400000,
      '4': 420000,
      '5': 450000,
      '6': 480000,
      '7': 500000,
      '8': 480000,
      '9': 450000,
      '10': 420000,
      '11': 400000,
      '12': 500000,
    },
  },
  {
    userId: '2',
    yearlyTarget: 6000000, // 6M Kč roční plán
    monthlyBreakdown: {
      '1': 450000,
      '2': 450000,
      '3': 500000,
      '4': 520000,
      '5': 550000,
      '6': 580000,
      '7': 600000,
      '8': 580000,
      '9': 550000,
      '10': 520000,
      '11': 500000,
      '12': 600000,
    },
  },
  {
    userId: '3',
    yearlyTarget: 4500000, // 4.5M Kč roční plán
    monthlyBreakdown: {
      '1': 300000,
      '2': 300000,
      '3': 350000,
      '4': 370000,
      '5': 400000,
      '6': 430000,
      '7': 450000,
      '8': 430000,
      '9': 400000,
      '10': 370000,
      '11': 350000,
      '12': 450000,
    },
  },
]

export const useSalesTargetStore = create<SalesTargetStore>()(
  persist(
    (set, get) => ({
      targets: DEFAULT_TARGETS,
      setSalesTarget: (userId, target) =>
        set((state) => ({
          targets: state.targets.map((t) =>
            t.userId === userId ? target : t
          ),
        })),
      getSalesTarget: (userId) => {
        const state = get()
        return state.targets.find((t) => t.userId === userId)
      },
      getAllTargets: () => get().targets,
      getMonthlyTarget: (userId, month) => {
        const state = get()
        const target = state.targets.find((t) => t.userId === userId)
        return target?.monthlyBreakdown[month.toString()] || 0
      },
    }),
    {
      name: 'solar-vision-targets',
    }
  )
)
