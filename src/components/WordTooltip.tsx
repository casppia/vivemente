import { motion } from 'framer-motion';
import { SaveWordButton } from './SaveWordButton';
import { AnalyzedWord } from '../utils/nlp';
import { CEFRLevel } from '../types/level';

interface WordTooltipProps {
  word: AnalyzedWord;
  position: { x: number; y: number };
  visible: boolean;
  level: CEFRLevel;
}

export function WordTooltip({ word, position, visible, level }: WordTooltipProps) {
  if (!visible) return null;

  // Calculate viewport boundaries
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Adjust position to keep tooltip within viewport
  const tooltipWidth = 200;
  const tooltipHeight = 120;
  
  let adjustedX = position.x;
  let adjustedY = position.y + 24;
  let placement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

  // Horizontal adjustment
  if (position.x + tooltipWidth > viewportWidth) {
    adjustedX = position.x - tooltipWidth;
    placement = 'left';
  }

  // Vertical adjustment
  if (position.y + tooltipHeight > viewportHeight) {
    adjustedY = position.y - tooltipHeight - 8;
    placement = 'top';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: placement === 'top' ? 4 : -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: placement === 'top' ? 4 : -4 }}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 min-w-[200px]"
      style={{
        top: adjustedY,
        left: adjustedX,
      }}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900 dark:text-white">
            {word.text}
          </span>
          {(word.type === 'verb' || word.type === 'noun' || word.type === 'adjective') && (
            <SaveWordButton
              word={word.text}
              type={word.type}
              level={level}
              translation={word.translation}
              lemma={word.lemma}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm px-2 py-0.5 rounded ${
            word.type === 'verb' 
              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
              : word.type === 'noun'
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
          }`}>
            {word.type}
          </span>
        </div>

        <div className="text-sm space-y-1">
          {word.lemma && (
            <p className="text-gray-600 dark:text-gray-400">
              Base form: <span className="font-medium">{word.lemma}</span>
            </p>
          )}
          
          {word.translation && (
            <p className="text-indigo-600 dark:text-indigo-400">
              {word.translation}
            </p>
          )}
          
          {word.features?.definition && (
            <p className="text-gray-600 dark:text-gray-400 text-xs italic">
              {word.features.definition}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}