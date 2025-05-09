import { create } from 'zustand';
import { CEFRLevel } from '../types/level';

interface LevelState {
  selectedLevel: CEFRLevel | null;
  setLevel: (level: CEFRLevel | null) => void;
}

export const useLevelStore = create<LevelState>((set) => ({
  selectedLevel: null,
  setLevel: (level) => set({ selectedLevel: level }),
}));