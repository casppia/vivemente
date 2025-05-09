import { motion } from 'framer-motion';

interface TextStatsProps {
  stats: {
    verbs: number;
    nouns: number;
    adjectives: number;
    total: number;
  };
}

export function TextStats({ stats }: TextStatsProps) {
  // Prevent division by zero and ensure valid percentages
  const calculatePercentage = (count: number): string => {
    if (stats.total === 0) return '0.0';
    return ((count / stats.total) * 100).toFixed(1);
  };

  // Log statistics for debugging
  console.log('Text Statistics:', {
    stats,
    verbPercentage: calculatePercentage(stats.verbs),
    nounPercentage: calculatePercentage(stats.nouns),
    adjPercentage: calculatePercentage(stats.adjectives)
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Text Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
        >
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.verbs}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Verbs</div>
          <div className="text-xs text-blue-500 dark:text-blue-300 mt-1">
            {calculatePercentage(stats.verbs)}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
        >
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.nouns}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Nouns</div>
          <div className="text-xs text-green-500 dark:text-green-300 mt-1">
            {calculatePercentage(stats.nouns)}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
        >
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.adjectives}
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400">Adjectives</div>
          <div className="text-xs text-orange-500 dark:text-orange-300 mt-1">
            {calculatePercentage(stats.adjectives)}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
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