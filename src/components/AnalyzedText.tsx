import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AnalyzedWord } from '../utils/nlp';
import { SpanishAudioPlayer } from './SpanishAudioPlayer';
import { WordTooltip } from './WordTooltip';
import { WordInteractionModal } from './WordInteractionModal';
import { CEFRLevel } from '../types/level';
import { TextRecorder, PronunciationFeedback } from './TextRecorder';
import { Award, TrendingUp, Target, Lightbulb, AlertCircle } from 'lucide-react';

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
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);

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
          <div className="mt-6 space-y-6">
            {/* Score Overview */}
            {feedback.score && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Performance Score
                  </h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {feedback.score.overall}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Overall</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {feedback.score.pronunciation}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pronunciation</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {feedback.score.fluency}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Fluency</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {feedback.score.accuracy}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Accuracy</div>
                  </div>
                </div>
              </div>
            )}

            {/* Strengths */}
            {feedback.strengths && feedback.strengths.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    What You Did Well
                  </h4>
                </div>
                <ul className="space-y-2">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Problem Words */}
            {feedback.problemWords && feedback.problemWords.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Words to Practice
                  </h4>
                </div>
                <div className="space-y-4">
                  {feedback.problemWords.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">
                        "{item.word}"
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-medium">Issue:</span> {item.issue}
                      </div>
                      <div className="text-sm text-orange-600 dark:text-orange-400">
                        <span className="font-medium">💡 Tip:</span> {item.tip}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Feedback */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Pronunciation Analysis
                  </h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {feedback.pronunciation}
                </p>
              </div>

              {feedback.grammar && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Grammar & Accuracy
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {feedback.grammar}
                  </p>
                </div>
              )}
            </div>

            {/* Improvement Tips */}
            {feedback.detailedTips && feedback.detailedTips.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Improvement Tips
                  </h4>
                </div>
                <ul className="space-y-2">
                  {feedback.detailedTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="flex-1">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Suggestions */}
            {feedback.suggestions.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Quick Action Items
                </h4>
                <ul className="space-y-2">
                  {feedback.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-gray-500 dark:text-gray-400">•</span>
                      <span>{suggestion}</span>
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