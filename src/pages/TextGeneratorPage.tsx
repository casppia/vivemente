import { useState } from 'react';
import { motion } from 'framer-motion';
import { TextGenerator } from '../components/TextGenerator';
import { TextAnalysis } from '../components/TextAnalysis';
import { TextImageProcessor } from '../components/TextImageProcessor';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguageStore } from '../store/useLanguageStore';

type Tab = 'generator' | 'analyzer' | 'image';

export function TextGeneratorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('generator');
  const { showTranslation } = useLanguageStore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-12">
        <nav className="relative flex items-center">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
          <div className="flex items-center gap-12">
            <button
              onClick={() => setActiveTab('generator')}
              className={`relative py-4 text-lg font-medium transition-colors ${
                activeTab === 'generator'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Text Generator
              {activeTab === 'generator' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                  initial={false}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`relative py-4 text-lg font-medium transition-colors ${
                activeTab === 'analyzer'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Text Analysis
              {activeTab === 'analyzer' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                  initial={false}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`relative py-4 text-lg font-medium transition-colors ${
                activeTab === 'image'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Image to Text
              {activeTab === 'image' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                  initial={false}
                />
              )}
            </button>
          </div>
        </nav>
        <LanguageSelector />
      </div>

      <div className="mt-8">
        {activeTab === 'generator' ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <TextGenerator />
          </motion.div>
        ) : activeTab === 'analyzer' ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <TextAnalysis level="B1" showTranslation={showTranslation} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <TextImageProcessor />
          </motion.div>
        )}
      </div>
    </div>
  );
}