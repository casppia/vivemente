import { motion, AnimatePresence } from 'framer-motion';

interface Conjugation {
  verb: string;
  infinitive: string;
  tense: string;
  explanation: string;
}

interface VerbTooltipProps {
  word: string;
  conjugation: Conjugation[];
  isVisible: boolean;
  position: { x: number; y: number };
}

export function VerbTooltip({ word, conjugation, isVisible, position }: VerbTooltipProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y + 24,
            zIndex: 50,
          }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm"
        >
          <div className="space-y-2">
            {conjugation.map((conj, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {conj.verb}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {conj.infinitive}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 italic">
                    ({conj.tense})
                  </span>
                </div>
                {conj.explanation && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {conj.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}