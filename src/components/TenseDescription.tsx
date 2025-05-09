import { motion } from 'framer-motion';
import { TenseDescription as TenseDescriptionType } from '../types/tenses';

interface TenseDescriptionProps {
  tense: TenseDescriptionType;
}

export function TenseDescription({ tense }: TenseDescriptionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {tense.name}
        </h3>
        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium">
          {tense.level}
        </span>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Formation
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            {tense.formation}
          </p>
        </div>

        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Example with "{tense.example.infinitive}"
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(tense.example.conjugation).map(([person, form]) => (
              <div key={person} className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400 font-medium w-20">
                  {person}:
                </span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {form}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Usage
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {tense.usage.map((use, index) => (
              <li key={index} className="text-gray-600 dark:text-gray-400">
                {use}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Key Time Markers
          </h4>
          <div className="flex flex-wrap gap-2">
            {tense.timeMarkers.map((marker, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
              >
                {marker}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}