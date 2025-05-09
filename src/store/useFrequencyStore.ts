import { create } from 'zustand';

export type FrequencyLevel = 1000 | 3000 | 5000;

interface FrequencyState {
  selectedFrequency: FrequencyLevel;
  setFrequency: (frequency: FrequencyLevel) => void;
}

export const useFrequencyStore = create<FrequencyState>((set) => ({
  selectedFrequency: 3000,
  setFrequency: (frequency) => set({ selectedFrequency: frequency }),
}));