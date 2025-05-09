import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AnalyzedWord } from '../utils/nlp';
import { SpanishAudioPlayer } from './SpanishAudioPlayer';
import { WordTooltip } from './WordTooltip';
import { WordInteractionModal } from './WordInteractionModal';
import { CEFRLevel } from '../types/level';
import { TextRecorder } from './TextRecorder';

interface AnalyzedTextProps {
  text: string;
  words: AnalyzedWord[];
  level: CEFRLevel;
  translation?: string;
  culturalNotes?: string[];
}

export function AnalyzedText({ text, words, level, translation, culturalNotes }: AnalyzedTextProps) {
  const [hoveredWord, setHoveredWord] = useState<{
    word: AnalyzedWord;
    position: { x: number; y: number };
  } | null>(null);
  const [selectedWord, setSelectedWord] = useState<AnalyzedWord | null>(null);
  const [feedback, setFeedback] = useState<{
    pronunciation: string;
    grammar: string;
    suggestions: string[];
  } | null>(null);

  const handleWordHover = (word: AnalyzedWord, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredWord({
      word,
      position: { x: rect.left, y: rect.top },
    });
  };

  const handleWordClick = (word: AnalyzedWord) => {
    setSelectedWord(word);
    setHoveredWord(null);
  };

  const getWordStyle = (type: AnalyzedWord['type']) => {
    switch (type) {
      case 'verb':
        return 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20';
      case 'noun':
        return 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20';
      case 'adjective':
        return 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800';
    }
  };

  const tokenize = (text: string) => {
    return text.match(/[\wáéíóúüñÁÉÍÓÚÜÑ]+|[.,!?;:¿¡]|\s+/g) || [];
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Spanish Text
          </h3>
          <div className="flex items-center gap-2">
            <SpanishAudioPlayer text={text} />
            <TextRecorder text={text} onFeedback={setFeedback} />
          </div>
        </div>
        <p className="text-gray-900 dark:text-white leading-relaxed">
          {tokenize(text).map((token, index) => {
            if (/^\s+$/.test(token)) {
              return ' ';
            }

            if (/^[.,!?;:¿¡]$/.test(token)) {
              return <span key={index}>{token}</span>;
            }

            const analyzedWord = words.find(w => w.text.toLowerCase() === token.toLowerCase());
            return (
              <span
                key={`${token}-${index}`}
                className={`inline-block cursor-pointer transition-colors ${
                  analyzedWord ? getWordStyle(analyzedWord.type) : ''
                }`}
                onMouseEnter={(e) => analyzedWord && handleWordHover(analyzedWord, e)}
                onMouseLeave={() => setHoveredWord(null)}
                onClick={() => analyzedWord && handleWordClick(analyzedWord)}
              >
                {token}
              </span>
            );
          })}
        </p>

        {feedback && (
          <div className="mt-6 space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pronunciation
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {feedback.pronunciation}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Grammar
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {feedback.grammar}
              </p>
            </div>
            {feedback.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Suggestions
                </h4>
                <ul className="mt-1 space-y-1">
                  {feedback.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-400">
                      • {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {translation && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            English Translation
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {translation}
          </p>
        </div>
      )}

      {culturalNotes && culturalNotes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cultural Notes
          </h3>
          <ul className="space-y-2">
            {culturalNotes.map((note, index) => (
              <li key={index} className="text-gray-600 dark:text-gray-400">
                • {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      <AnimatePresence>
        {hoveredWord && (
          <WordTooltip
            word={hoveredWord.word}
            position={hoveredWord.position}
            visible={true}
            level={level}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedWord && (
          <WordInteractionModal
            word={selectedWord.text}
            type={selectedWord.type as 'verb' | 'noun' | 'adjective'}
            level={level}
            translation={selectedWord.translation}
            onClose={() => setSelectedWord(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}