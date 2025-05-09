import { motion } from 'framer-motion';
import { useFrequencyStore, FrequencyLevel } from '../store/useFrequencyStore';

export function FrequencySelector() {
  const { selectedFrequency, setFrequency } = useFrequencyStore();

  const frequencies: FrequencyLevel[] = [1000, 3000, 5000];

  const getFrequencyDescription = (frequency: FrequencyLevel) => {
    switch (frequency) {
      case 1000:
        return 'Most common words introduced at this level';
      case 3000:
        return 'Extended vocabulary specific to this level';
      case 5000:
        return 'Advanced vocabulary unique to this level';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Vocabulary Filter
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Using {selectedFrequency === 1000 ? 'basic' : selectedFrequency === 3000 ? 'extended' : 'advanced'} vocabulary (top {selectedFrequency} words)
        </p>
      </div>

      <div className="flex gap-4">
        {frequencies.map((frequency) => (
          <motion.button
            key={frequency}
            onClick={() => setFrequency(frequency)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              frequency === selectedFrequency
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span className="block">Top {frequency}</span>
            <span className="block text-xs mt-1 opacity-80">
              {frequency === 1000 ? 'Basic' : frequency === 3000 ? 'Extended' : 'Advanced'}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {getFrequencyDescription(selectedFrequency)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
          Note: Words from previous levels are excluded to focus on level-specific vocabulary
        </p>
      </div>
    </div>
  );
}