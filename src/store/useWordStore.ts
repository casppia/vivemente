import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CEFRLevel } from '../types/level';

export interface SavedWord {
  word: string;
  type: 'verb' | 'noun' | 'adjective';
  level: CEFRLevel;
  timestamp?: number;
  conjugation?: {
    infinitive: string;
    conjugatedForm: string;
    tense: string;
    person?: string;
  };
  notes?: string;
  mastered?: boolean;
  masteredAt?: number;
  isLearned?: boolean;
  learnedAt?: number;
  source?: string;
  translation?: string;
}

interface WordState {
  savedWords: SavedWord[];
  addWord: (word: SavedWord) => void;
  removeWord: (word: string) => void;
  updateWord: (word: string, updates: Partial<SavedWord>) => void;
  markAsLearned: (word: string) => void;
  markAsUnlearned: (word: string) => void;
}

export const useWordStore = create<WordState>()(
  persist(
    (set) => ({
      savedWords: [],
      addWord: (word) => 
        set((state) => {
          // Convert word to lowercase for case-insensitive comparison
          const normalizedWord = word.word.toLowerCase();
          
          // Check if word already exists (case-insensitive)
          const wordExists = state.savedWords.some(w => 
            w.word.toLowerCase() === normalizedWord
          );
          
          if (wordExists) {
            console.log(`Word "${word.word}" already exists in saved words`);
            return state;
          }
          
          return {
            savedWords: [...state.savedWords, {
              ...word,
              // Store the word in lowercase
              word: normalizedWord,
              timestamp: Date.now(),
              mastered: false,
              notes: '',
              isLearned: false
            }]
          };
        }),
      removeWord: (word) =>
        set((state) => ({
          savedWords: state.savedWords.filter((w) => 
            w.word.toLowerCase() !== word.toLowerCase()
          )
        })),
      updateWord: (word, updates) =>
        set((state) => ({
          savedWords: state.savedWords.map((w) =>
            w.word.toLowerCase() === word.toLowerCase() 
              ? { ...w, ...updates }
              : w
          )
        })),
      markAsLearned: (word) =>
        set((state) => ({
          savedWords: state.savedWords.map((w) =>
            w.word.toLowerCase() === word.toLowerCase()
              ? { ...w, isLearned: true, learnedAt: Date.now() }
              : w
          )
        })),
      markAsUnlearned: (word) =>
        set((state) => ({
          savedWords: state.savedWords.map((w) =>
            w.word.toLowerCase() === word.toLowerCase()
              ? { ...w, isLearned: false, learnedAt: undefined }
              : w
          )
        })),
    }),
    {
      name: 'word-store',
    }
  )
);