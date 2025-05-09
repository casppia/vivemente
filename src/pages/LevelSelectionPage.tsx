import { motion } from 'framer-motion';
import { CEFR_LEVELS } from '../types/level';
import { useLevelStore } from '../store/useLevelStore';
import { useNavigate } from 'react-router-dom';

export function LevelSelectionPage() {
  const navigate = useNavigate();
  const { setLevel } = useLevelStore();

  const handleLevelSelect = (level: typeof CEFR_LEVELS[number]) => {
    setLevel(level.name);
    navigate(`/level/${level.name.toLowerCase()}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Choose Your Spanish Level
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CEFR_LEVELS.map((level, index) => (
          <motion.button
            key={level.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleLevelSelect(level)}
            className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left group relative overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-${level.color}-500/5 group-hover:bg-${level.color}-500/10 transition-colors`} />
            
            <div className="relative">
              <div className="flex items-center mb-4">
                <span className={`text-${level.color}-600 dark:text-${level.color}-400 text-2xl font-bold mr-3`}>
                  {level.name}
                </span>
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {level.title}
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400">
                {level.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}