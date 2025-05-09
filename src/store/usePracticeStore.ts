import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TensePracticeStats } from '../types/practice';

interface PracticeState {
  practiceStats: TensePracticeStats[];
  incrementPracticeCount: (tenseName: string) => void;
  getPracticeStats: (tenseName: string) => TensePracticeStats;
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      practiceStats: [],
      
      incrementPracticeCount: (tenseName: string) => set((state) => {
        const existingStats = state.practiceStats.find(s => s.tenseName === tenseName);
        
        if (existingStats) {
          return {
            practiceStats: state.practiceStats.map(s =>
              s.tenseName === tenseName
                ? {
                    ...s,
                    practiceCount: s.practiceCount + 1,
                    lastPracticed: Date.now()
                  }
                : s
            )
          };
        }
        
        return {
          practiceStats: [
            ...state.practiceStats,
            {
              tenseName,
              practiceCount: 1,
              lastPracticed: Date.now()
            }
          ]
        };
      }),

      getPracticeStats: (tenseName: string) => {
        const stats = get().practiceStats.find(s => s.tenseName === tenseName);
        return stats || { tenseName, practiceCount: 0 };
      }
    }),
    {
      name: 'practice-store'
    }
  )
);