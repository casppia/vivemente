import { create } from 'zustand';

export type TargetLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

interface LanguageState {
  targetLanguage: TargetLanguage;
  showTranslation: boolean;
  setTargetLanguage: (language: TargetLanguage) => void;
  toggleTranslation: () => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  targetLanguage: 'en',
  showTranslation: true,
  setTargetLanguage: (language) => set({ targetLanguage: language }),
  toggleTranslation: () => set((state) => ({ showTranslation: !state.showTranslation })),
}));