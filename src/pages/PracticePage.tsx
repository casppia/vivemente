import { useState } from 'react';
import { motion } from 'framer-motion';
import { CEFR_LEVELS } from '../types/level';
import { LEVEL_TENSES } from '../types/practice';
import { ConjugationPractice } from '../components/ConjugationPractice';
import { TenseTheory } from '../components/TenseTheory';

export function PracticePage() {
  const [selectedLevel, setSelectedLevel] = useState(CEFR_LEVELS[0].name);
  const [showTheory, setShowTheory] = useState(true);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Conjugation Practice
        </h1>
        <button
          onClick={() => setShowTheory(!showTheory)}
          className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
        >
          {showTheory ? 'Hide Theory' : 'Show Theory'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
        {CEFR_LEVELS.map((level) => (
          <motion.button
            key={level.name}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedLevel(level.name)}
            className={`p-3 rounded-lg text-center transition-colors ${
              selectedLevel === level.name
                ? `bg-${level.color}-600 text-white`
                : `bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                   hover:bg-${level.color}-100 dark:hover:bg-${level.color}-900/20`
            }`}
          >
            <span className="block text-lg font-bold">{level.name}</span>
            <span className="block text-sm mt-1">{level.title}</span>
          </motion.button>
        ))}
      </div>

      {showTheory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <TenseTheory />
        </motion.div>
      )}

      <div className="space-y-6">
        {LEVEL_TENSES[selectedLevel].map((tense) => (
          <ConjugationPractice
            key={tense.name}
            level={selectedLevel}
            tense={tense}
          />
        ))}
      </div>
    </div>
  );
}