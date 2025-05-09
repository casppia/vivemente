import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkPlus, Check } from 'lucide-react';
import { useWordStore } from '../store/useWordStore';
import { CEFRLevel } from '../types/level';

interface SaveWordButtonProps {
  word: string;
  type: 'verb' | 'noun' | 'adjective';
  level: CEFRLevel;
  translation?: string;
  lemma?: string;
}

export function SaveWordButton({ word, type, level, translation, lemma }: SaveWordButtonProps) {
  const { savedWords, addWord } = useWordStore();
  const [saved, setSaved] = useState(savedWords.some(w => w.word === word));
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    if (!saved) {
      setShowConfirm(true);
    }
  };

  const handleConfirm = (confirmed: boolean) => {
    if (confirmed) {
      addWord({
        word,
        type,
        level,
        translation,
        lemma,
        timestamp: Date.now(),
      });
      setSaved(true);
    }
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={handleSave}
        className={`p-1 rounded-full transition-colors ${
          saved
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
            : 'text-gray-400 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
        }`}
        title={saved ? 'Word saved' : 'Save word'}
      >
        {saved ? (
          <Check className="w-4 h-4" />
        ) : (
          <BookmarkPlus className="w-4 h-4" />
        )}
      </button>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full mx-4"
            >
              <p className="text-gray-900 dark:text-white mb-4">
                Save "{word}" ({type}) to your vocabulary list?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleConfirm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirm(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}