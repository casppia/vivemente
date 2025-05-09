import { motion } from 'framer-motion';

export function FavoritesPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Favorites
      </h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center h-[60vh]"
      >
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Your favorite examples will appear here
        </p>
      </motion.div>
    </div>
  );
}