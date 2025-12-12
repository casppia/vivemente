import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, BookmarkPlus, RefreshCw, Languages } from 'lucide-react';
import { useWordStore } from '../store/useWordStore';
import { generateText } from '../utils/openai';
import { SpanishAudioPlayer } from './SpanishAudioPlayer';
import { CEFRLevel } from '../types/level';

interface Example {
  spanish: string;
  english: string;
}

interface WordInteractionModalProps {
  word: string;
  type: 'verb' | 'noun' | 'adjective';
  level: CEFRLevel;
  translation?: string;
  onClose: () => void;
}

export function WordInteractionModal({
  word,
  type,
  level,
  translation,
  onClose
}: WordInteractionModalProps) {
  const { addWord, savedWords } = useWordStore();
  const [examples, setExamples] = useState<Example[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(savedWords.some(w => w.word === word));
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [visibleTranslations, setVisibleTranslations] = useState<number[]>([]);
  const [wordTranslation, setWordTranslation] = useState(translation || '');

  const handleSave = useCallback(async () => {
    if (!isSaved) {
      try {
        // If no translation is provided, get one
        let finalTranslation = wordTranslation;
        if (!finalTranslation) {
          const prompt = `Translate this Spanish word to English: "${word}"
          Return ONLY the English translation, no other text.`;

          const response = await generateText(prompt, {
            model: 'gpt-3.5-turbo',
            maxTokens: 20,
            temperature: 0.3,
          });

          finalTranslation = response.trim();
        }

        addWord({
          word,
          type,
          level,
          translation: finalTranslation,
          timestamp: Date.now()
        });
        
        setIsSaved(true);
        setSaveSuccess(true);
        
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (error) {
        console.error('Error saving word:', error);
        setError('Failed to save word. Please try again.');
      }
    }
  }, [word, type, level, wordTranslation, isSaved, addWord, onClose]);

  const generateExamples = useCallback(async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Generate 3 Spanish sentences using the word "${word}" (${type}) at ${level} level.
      Requirements:
      - Make sentences natural and contextually appropriate
      - Show different uses of the word
      - Keep sentences at ${level} level difficulty
      - Show different contexts
      - Include English translations
      
      Return the response as a JSON array of 3 examples. Each example should have this format:
      {
        "spanish": "Spanish sentence",
        "english": "English translation"
      }
      
      Return ONLY the JSON array, no other text.`;

      const response = await generateText(prompt, {
        model: 'gpt-3.5-turbo',
        maxTokens: 500,
        temperature: 0.7,
      });

      const examples = JSON.parse(response);
      setExamples(examples);
      setVisibleTranslations([]);
      setError(null);
    } catch (err) {
      console.error('Error generating examples:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate examples. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [word, type, level, isGenerating]);

  const toggleTranslation = (index: number) => {
    setVisibleTranslations(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-lg w-full mx-auto my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-t-xl border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {word}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm px-2 py-0.5 rounded ${
                  type === 'verb'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : type === 'noun'
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                }`}>
                  {type}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {level}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-16rem)]">
          {wordTranslation && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Translation
              </h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Languages className="w-5 h-5 text-gray-400" />
                <p className="text-lg text-gray-900 dark:text-white font-medium">
                  {wordTranslation}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSaved
                  ? saveSuccess
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <BookmarkPlus className="w-4 h-4 mr-2" />
              {saveSuccess ? 'Saved!' : isSaved ? 'Word Saved' : 'Save Word'}
            </button>

            <button
              onClick={generateExamples}
              disabled={isGenerating}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isGenerating
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Examples'
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 text-sm underline mt-2"
              >
                Try Again
              </button>
            </div>
          )}

          {examples.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Example Sentences
              </h3>
              <div className="space-y-4">
                {examples.map((example, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-900 dark:text-white">{example.spanish}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleTranslation(index)}
                          className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                          title={visibleTranslations.includes(index) ? "Hide translation" : "Show translation"}
                        >
                          <Languages className="w-5 h-5" />
                        </button>
                        <SpanishAudioPlayer text={example.spanish} />
                      </div>
                    </div>
                    {visibleTranslations.includes(index) && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-gray-600 dark:text-gray-400 text-sm mt-2 border-t border-gray-200 dark:border-gray-600 pt-2"
                      >
                        {example.english}
                      </motion.p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}