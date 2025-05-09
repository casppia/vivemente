import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTopicStore } from '../store/useTopicStore';

export function TopicsPage() {
  const { topics } = useTopicStore();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        B1 Mexican Spanish
      </h1>
      
      <div className="space-y-4">
        {topics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={`/topic/${topic.id}`}
              className="block bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative group"
            >
              <div className="flex items-center mb-4">
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold mr-4">
                  {String(topic.id).padStart(2, '0')}
                </span>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {topic.title}
                </h2>
              </div>
              
              <div className="space-y-1">
                {topic.preview.map((item, i) => (
                  <p
                    key={i}
                    className="text-gray-600 dark:text-gray-400 pl-4 before:content-['•'] before:mr-2"
                  >
                    {item}
                  </p>
                ))}
              </div>
              
              <ChevronRight
                className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                size={20}
              />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}