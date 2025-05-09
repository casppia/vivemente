import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWordStore } from '../store/useWordStore';
import { CEFRLevel } from '../types/level';

interface AnalyzedWord {
  text: string;
  type: 'verb' | 'noun' | 'adjective';
  level: CEFRLevel;
  definition?: string;
  translation?: string;
}

interface WordTooltipProps {
  word: AnalyzedWord;
  position: { x: number; y: number };
}

function WordTooltip({ word, position }: WordTooltipProps) {
  return (
    <span
      className="absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-sm"
      style={{
        top: `${position.y + 24}px`,
        left: `${position.x}px`,
      }}
    >
      <span className="block font-medium text-gray-900 dark:text-white">{word.text}</span>
      <span className="block text-gray-500 dark:text-gray-400 capitalize">{word.type}</span>
      {word.definition && (
        <span className="block text-gray-600 dark:text-gray-300 mt-1">{word.definition}</span>
      )}
      {word.translation && (
        <span className="block text-indigo-600 dark:text-indigo-400 mt-1">{word.translation}</span>
      )}
    </span>
  );
}

interface InteractiveWordProps {
  word: AnalyzedWord;
  onSave: (word: AnalyzedWord) => void;
  isSaved: boolean;
}

function InteractiveWord({ word, onSave, isSaved }: InteractiveWordProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left,
      y: rect.top,
    });
    setShowTooltip(true);
  };

  const getWordStyle = () => {
    switch (word.type) {
      case 'verb':
        return 'text-blue-600 dark:text-blue-400';
      case 'noun':
        return 'text-green-600 dark:text-green-400';
      case 'adjective':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-900 dark:text-white';
    }
  };

  return (
    <span className="relative inline-block">
      <button
        className={`${getWordStyle()} hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded ${
          isSaved ? 'font-bold' : ''
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => onSave(word)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onSave(word);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`${word.text} (${word.type})`}
      >
        {word.text}
      </button>
      {showTooltip && <WordTooltip word={word} position={tooltipPosition} />}
    </span>
  );
}

interface AnalyzedTextProps {
  text: string;
  words: AnalyzedWord[];
  level: CEFRLevel;
}

export function AnalyzedText({ text, words, level }: AnalyzedTextProps) {
  const { addWord, savedWords } = useWordStore();
  const [showConfirm, setShowConfirm] = useState<AnalyzedWord | null>(null);

  const handleSaveWord = (word: AnalyzedWord) => {
    setShowConfirm(word);
  };

  const handleConfirm = (confirmed: boolean) => {
    if (confirmed && showConfirm) {
      addWord({
        word: showConfirm.text,
        type: showConfirm.type,
        level: level,
      });
    }
    setShowConfirm(null);
  };

  const isWordSaved = (text: string): boolean => {
    return savedWords.some((w) => w.word === text);
  };

  const textParts = text.split(/(\s+)/);
  
  return (
    <div className="relative">
      <div className="text-gray-900 dark:text-white mb-4">
        {textParts.map((part, index) => {
          const analyzedWord = words.find((w) => w.text === part);
          if (analyzedWord) {
            return (
              <InteractiveWord
                key={`${part}-${index}`}
                word={analyzedWord}
                onSave={handleSaveWord}
                isSaved={isWordSaved(analyzedWord.text)}
              />
            );
          }
          return <span key={`${part}-${index}`}>{part}</span>;
        })}
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

export type { AnalyzedWord, AnalyzedTextProps };