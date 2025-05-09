import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { CEFR_LEVELS } from '../types/level';
import { useTopicStore } from '../store/useTopicStore';
import { TopicSection } from '../types/topic';

export function LevelTopicsPage() {
  const { level } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const { getTopicsByLevel } = useTopicStore();
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);

  const levelInfo = CEFR_LEVELS.find(
    (l) => l.name.toLowerCase() === level?.toLowerCase()
  );

  if (!levelInfo) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Level not found
        </h1>
      </div>
    );
  }

  const categories = getTopicsByLevel(levelInfo.name);

  const handleSectionClick = (topicId: number, section: TopicSection) => {
    navigate(`/topic/${topicId}/${section.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 mr-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ChevronLeft className="text-gray-900 dark:text-white" size={24} />
        </button>
        
        <div>
          <div className="flex items-center">
            <span className={`text-${levelInfo.color}-600 dark:text-${levelInfo.color}-400 text-2xl font-bold mr-3`}>
              {levelInfo.name}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {levelInfo.title}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {levelInfo.description}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.name} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {category.name}
            </h2>
            
            <div className="space-y-4">
              {category.topics.map((topic) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden`}
                  >
                    <button
                      onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                      className="w-full text-left p-6 focus:outline-none"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <span className={`text-${levelInfo.color}-600 dark:text-${levelInfo.color}-400 font-semibold mr-4`}>
                              {String(topic.id).padStart(2, '0')}
                            </span>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {topic.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {topic.spanishTitle}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {expandedTopic === topic.id ? (
                          <ChevronUp className={`text-${levelInfo.color}-600 dark:text-${levelInfo.color}-400`} size={20} />
                        ) : (
                          <ChevronDown className={`text-${levelInfo.color}-600 dark:text-${levelInfo.color}-400`} size={20} />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedTopic === topic.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-gray-200 dark:border-gray-700"
                        >
                          <div className="p-6 space-y-4">
                            {topic.sections.map((section) => (
                              <div 
                                key={section.id}
                                onClick={() => handleSectionClick(topic.id, section)}
                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-4 rounded-lg transition-colors"
                              >
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                                  {section.title}
                                  <ChevronRight size={16} className="ml-2 text-gray-400" />
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {section.content}
                                </p>
                              </div>
                            ))}
                            
                            <button
                              onClick={() => navigate(`/topic/${topic.id}`)}
                              className={`mt-4 w-full flex items-center justify-center py-2 px-4 bg-${levelInfo.color}-600 hover:bg-${levelInfo.color}-700 text-white rounded-lg transition-colors`}
                            >
                              <span className="mr-2">Study All Subtopics</span>
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}