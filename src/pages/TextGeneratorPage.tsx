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
      <div className="flex items-center justify-between mb-8">
        <nav className="flex items-center gap-8 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('generator')}
            className={`pb-4 px-1 text-lg font-medium border-b-2 transition-colors ${
              activeTab === 'generator'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Text Generator
          </button>
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`pb-4 px-1 text-lg font-medium border-b-2 transition-colors ${
              activeTab === 'analyzer'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Text Analysis
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`pb-4 px-1 text-lg font-medium border-b-2 transition-colors ${
              activeTab === 'image'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Image to Text
          </button>
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