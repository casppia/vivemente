import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TextStatsProps {
  stats: {
    verbs: number;
    nouns: number;
    adjectives: number;
    total: number;
    verbsList?: string[];
    nounsList?: string[];
    adjectivesList?: string[];
  };
}

export function TextStats({ stats }: TextStatsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Prevent division by zero and ensure valid percentages
  const calculatePercentage = (count: number): string => {
    if (stats.total === 0) return '0.0';
    return ((count / stats.total) * 100).toFixed(1);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderWordList = (words: string[], category: 'blue' | 'green' | 'orange') => {
    const colorClasses = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/10',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/10',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/10',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
      },
    };

    const colors = colorClasses[category];

    return (
      <div className={`mt-3 p-3 ${colors.bg} rounded-lg`}>
        <div className="flex flex-wrap gap-2">
          {words.length > 0 ? (
            words.map((word, index) => (
              <span
                key={index}
                className={`px-2 py-1 bg-white dark:bg-gray-800 ${colors.text} text-sm rounded-md border ${colors.border}`}
              >
                {word}
              </span>
            ))
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">No words found</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Text Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-1"
        >
          <button
            onClick={() => stats.verbsList && toggleSection('verbs')}
            className={`w-full p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-all ${
              stats.verbsList ? 'hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer' : ''
            }`}
            disabled={!stats.verbsList}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.verbs}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Verbs</div>
                <div className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                  {calculatePercentage(stats.verbs)}%
                </div>
              </div>
              {stats.verbsList && (
                expandedSection === 'verbs' ?
                  <ChevronUp className="w-5 h-5 text-blue-600 dark:text-blue-400" /> :
                  <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
          </button>
          <AnimatePresence>
            {expandedSection === 'verbs' && stats.verbsList && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {renderWordList(stats.verbsList, 'blue')}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1"
        >
          <button
            onClick={() => stats.nounsList && toggleSection('nouns')}
            className={`w-full p-4 bg-green-50 dark:bg-green-900/20 rounded-lg transition-all ${
              stats.nounsList ? 'hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer' : ''
            }`}
            disabled={!stats.nounsList}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.nouns}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Nouns</div>
                <div className="text-xs text-green-500 dark:text-green-300 mt-1">
                  {calculatePercentage(stats.nouns)}%
                </div>
              </div>
              {stats.nounsList && (
                expandedSection === 'nouns' ?
                  <ChevronUp className="w-5 h-5 text-green-600 dark:text-green-400" /> :
                  <ChevronDown className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
            </div>
          </button>
          <AnimatePresence>
            {expandedSection === 'nouns' && stats.nounsList && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {renderWordList(stats.nounsList, 'green')}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-1"
        >
          <button
            onClick={() => stats.adjectivesList && toggleSection('adjectives')}
            className={`w-full p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg transition-all ${
              stats.adjectivesList ? 'hover:bg-orange-100 dark:hover:bg-orange-900/30 cursor-pointer' : ''
            }`}
            disabled={!stats.adjectivesList}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.adjectives}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">Adjectives</div>
                <div className="text-xs text-orange-500 dark:text-orange-300 mt-1">
                  {calculatePercentage(stats.adjectives)}%
                </div>
              </div>
              {stats.adjectivesList && (
                expandedSection === 'adjectives' ?
                  <ChevronUp className="w-5 h-5 text-orange-600 dark:text-orange-400" /> :
                  <ChevronDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              )}
            </div>
          </button>
          <AnimatePresence>
            {expandedSection === 'adjectives' && stats.adjectivesList && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {renderWordList(stats.adjectivesList, 'orange')}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg md:col-span-1"
        >
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Words</div>
        </motion.div>
      </div>
    </div>
  );
}