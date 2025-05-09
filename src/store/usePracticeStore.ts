import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TensePracticeStats } from '../types/practice';
import { CEFRLevel } from '../types/level';

interface PracticeState {
  practiceStats: TensePracticeStats[];
  incrementPracticeCount: (tenseName: string, level: CEFRLevel) => void;
  getPracticeStats: (tenseName: string, level: CEFRLevel) => TensePracticeStats;
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      practiceStats: [],
      
      incrementPracticeCount: (tenseName: string, level: CEFRLevel) => set((state) => {
        const existingStats = state.practiceStats.find(s => 
          s.tenseName === tenseName && s.level === level
        );
        
        if (existingStats) {
          return {
            practiceStats: state.practiceStats.map(s =>
              s.tenseName === tenseName && s.level === level
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
              level,
              practiceCount: 1,
              lastPracticed: Date.now()
            }
          ]
        };
      }),

      getPracticeStats: (tenseName: string, level: CEFRLevel) => {
        const stats = get().practiceStats.find(s => 
          s.tenseName === tenseName && s.level === level
        );
        return stats || { tenseName, level, practiceCount: 0 };
      }
    }),
    {
      name: 'practice-store'
    }
  )
);