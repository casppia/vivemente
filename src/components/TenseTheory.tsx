import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LEVEL_TENSES } from '../types/practice';
import { CEFRLevel } from '../types/level';

interface ConjugationTableProps {
  verbs: {
    infinitive: string;
    conjugations: {
      yo: string;
      tu: string;
      el: string;
      nosotros: string;
      vosotros: string;
      ellos: string;
    };
  }[];
}

function ConjugationTable({ verbs }: ConjugationTableProps) {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">Person</th>
            {verbs.map(verb => (
              <th key={verb.infinitive} className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">
                {verb.infinitive}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(verbs[0].conjugations).map(person => (
            <tr key={person} className="border-t border-gray-200 dark:border-gray-700">
              <td className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">
                {person}
              </td>
              {verbs.map(verb => (
                <td key={`${verb.infinitive}-${person}`} className="px-4 py-2 text-gray-600 dark:text-gray-400">
                  {verb.conjugations[person as keyof typeof verb.conjugations]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TenseTheoryProps {
  level: CEFRLevel;
}

export default function TenseTheory({ level }: TenseTheoryProps) {
  const [expandedTense, setExpandedTense] = useState<string | null>(null);

  // Get tenses applicable for the selected level
  const applicableTenses = LEVEL_TENSES[level];

  return (
    <div className="space-y-4">
      {applicableTenses.map((tense) => (
        <div key={tense.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {tense.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {tense.description}
                </p>
              </div>
              <button
                onClick={() => setExpandedTense(expandedTense === tense.name ? null : tense.name)}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {expandedTense === tense.name ? 'Hide details' : 'Show details'}
                {expandedTense === tense.name ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {expandedTense === tense.name && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <div className="px-6 pb-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        When to use:
                      </h4>
                      <ul className="space-y-2">
                        {tense.description.split('. ').map((point, index) => (
                          <li key={index} className="text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Add conjugation examples here if needed */}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export { TenseTheory };