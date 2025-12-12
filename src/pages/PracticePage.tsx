import { useState } from 'react';
import { motion } from 'framer-motion';
import { CEFR_LEVELS } from '../types/level';
import { LEVEL_TENSES } from '../types/practice';
import { ConjugationPractice } from '../components/ConjugationPractice';

export function PracticePage() {
  const [selectedLevel, setSelectedLevel] = useState(CEFR_LEVELS[0].name);

  const applicableTenses = LEVEL_TENSES[selectedLevel];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Conjugation Practice
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select your level and practice verb conjugations. Hover over tense names for detailed explanations.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {CEFR_LEVELS.map((level) => (
          <motion.button
            key={level.name}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedLevel(level.name)}
            className={`p-4 rounded-xl text-center transition-all shadow-sm hover:shadow-md ${
              selectedLevel === level.name
                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <span className="block text-lg font-bold">{level.name}</span>
            <span className="block text-xs mt-1 opacity-90">{level.title}</span>
          </motion.button>
        ))}
      </div>

      <div className="space-y-6">
        {applicableTenses.map((tense) => (
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