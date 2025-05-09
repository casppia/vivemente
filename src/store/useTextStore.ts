import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subject, Word, GeneratedText } from '../types/text';
import { CEFRLevel } from '../types/level';
import { generateText } from '../utils/openai';
import { spanishAnalyzer } from '../utils/nlp';

interface TextState {
  selectedSubject: Subject | null;
  selectedLevel: CEFRLevel;
  customTopic: string;
  generatedText: GeneratedText | null;
  savedWords: Word[];
  isGenerating: boolean;
  error: string | null;
  setSelectedSubject: (subject: Subject) => void;
  setSelectedLevel: (level: CEFRLevel) => void;
  setCustomTopic: (topic: string) => void;
  generateContent: (prompt: string) => Promise<void>;
  saveWord: (word: Word) => void;
  removeWord: (text: string) => void;
  clearError: () => void;
}

export const useTextStore = create<TextState>()(
  persist(
    (set, get) => ({
      selectedSubject: null,
      selectedLevel: 'B1',
      customTopic: '',
      generatedText: null,
      savedWords: [],
      isGenerating: false,
      error: null,

      setSelectedSubject: (subject) => set({ selectedSubject: subject }),
      setSelectedLevel: (level) => set({ selectedLevel: level }),
      setCustomTopic: (topic) => set({ customTopic: topic }),

      generateContent: async (prompt: string) => {
        set({ isGenerating: true, error: null, generatedText: null });

        try {
          const response = await generateText(prompt, {
            model: 'gpt-3.5-turbo',
            maxTokens: 1000,
            temperature: 0.7,
          });

          const initialData = JSON.parse(response);

          // Analyze each paragraph
          const analyzedParagraphs = await Promise.all(
            initialData.spanish.map(async (text: string) => {
              const analysis = await spanishAnalyzer.analyzeSentence(text);
              return analysis;
            })
          );

          // Combine all words from analysis
          const allWords = analyzedParagraphs.flatMap(analysis => analysis.words);

          // Create the final text object
          const finalText: GeneratedText = {
            spanish: initialData.spanish,
            english: initialData.english,
            words: allWords.map(word => ({
              text: word.text,
              type: word.type,
              definition: word.features?.definition || '',
              translation: word.translation || '',
              context: `Used at ${get().selectedLevel} level`,
            })),
            analysis: {
              verbs: allWords.filter(w => w.type === 'verb').map(w => w.text),
              nouns: allWords.filter(w => w.type === 'noun').map(w => w.text),
              adjectives: allWords.filter(w => w.type === 'adjective').map(w => w.text),
            },
          };

          set({ generatedText: finalText, isGenerating: false });
        } catch (error) {
          console.error('Error generating content:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to generate text',
            isGenerating: false,
          });
        }
      },

      saveWord: (word) => set((state) => ({
        savedWords: [...state.savedWords, { ...word, timestamp: Date.now() }],
      })),

      removeWord: (text) => set((state) => ({
        savedWords: state.savedWords.filter((word) => word.text !== text),
      })),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'text-store',
      partialize: (state) => ({
        savedWords: state.savedWords,
        selectedLevel: state.selectedLevel,
      }),
    }
  )
);