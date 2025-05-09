import { useState } from 'react';
import { useWordStore } from '../store/useWordStore';
import { CEFRLevel } from '../types/level';
import { SpanishAudioButton } from './SpanishAudioButton';

interface Word {
  text: string;
  type: 'verb' | 'noun' | 'adjective';
  level: CEFRLevel;
}

interface WordAnalysisProps {
  sentence: string;
  words: {
    verbs: Word[];
    nouns: Word[];
    adjectives: Word[];
  };
  level: CEFRLevel;
  english: string;
  note?: string;
  conjugation?: {
    verb: string;
    infinitive: string;
    tense: string;
    explanation?: string;
  }[];
}

export function WordAnalysis({
  sentence,
  words,
  level,
  english,
  note,
  conjugation,
}: WordAnalysisProps) {
  const { addWord, savedWords } = useWordStore();
  const [showConfirm, setShowConfirm] = useState<Word | null>(null);

  const handleWordClick = (word: Word) => {
    setShowConfirm(word);
  };

  const handleConfirm = (confirmed: boolean) => {
    if (confirmed && showConfirm) {
      const conjugationInfo = conjugation?.find(c => c.verb === showConfirm.text);
      
      addWord({
        word: showConfirm.text,
        type: showConfirm.type,
        level: level,
        conjugation: conjugationInfo ? {
          infinitive: conjugationInfo.infinitive,
          conjugatedForm: conjugationInfo.verb,
          tense: conjugationInfo.tense
        } : undefined
      });
    }
    setShowConfirm(null);
  };

  const isWordSaved = (text: string): boolean => {
    return savedWords.some(w => w.word === text);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xl font-medium text-gray-900 dark:text-white">
          {sentence}
        </p>
        <SpanishAudioButton text={sentence} />
      </div>

      {conjugation && conjugation.length > 0 && (
        <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <div className="flex flex-wrap gap-4">
            {conjugation.map((conj, index) => (
              <div key={index} className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  <span>{conj.verb}</span>
                  <span className="text-indigo-400 dark:text-indigo-500">
                    →
                  </span>
                  <span>{conj.infinitive}</span>
                </div>
                <div className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                  <span className="font-medium">{conj.tense}</span>
                  {conj.explanation && (
                    <p className="mt-1 text-indigo-500 dark:text-indigo-400 italic">
                      {conj.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            Verbs
          </span>
          {words.verbs.map((word, index) => (
            <button
              key={index}
              onClick={() => handleWordClick(word)}
              className={`text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isWordSaved(word.text) ? 'font-bold' : ''
              }`}
            >
              {word.text}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            Nouns
          </span>
          {words.nouns.map((word, index) => (
            <button
              key={index}
              onClick={() => handleWordClick(word)}
              className={`text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isWordSaved(word.text) ? 'font-bold' : ''
              }`}
            >
              {word.text}
            </button>
          ))}
        </div>

        {words.adjectives.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              Adjectives
            </span>
            {words.adjectives.map((word, index) => (
              <button
                key={index}
                onClick={() => handleWordClick(word)}
                className={`text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isWordSaved(word.text) ? 'font-bold' : ''
                }`}
              >
                {word.text}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <p className="text-gray-600 dark:text-gray-400">{english}</p>
        {note && (
          <p className="text-indigo-600 dark:text-indigo-400 text-sm italic">
            Note: {note}
          </p>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <p className="text-gray-900 dark:text-white mb-4">
              Would you like to save '{showConfirm.text}' to your vocabulary list?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => handleConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}