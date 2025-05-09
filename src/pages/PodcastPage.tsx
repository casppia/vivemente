import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSpotifyStore } from '../store/useSpotifyStore';
import { PodcastPlayer } from '../components/PodcastPlayer';
import { Headphones, RefreshCw } from 'lucide-react';

export function PodcastPage() {
  const {
    initialize,
    isAuthenticated,
    login,
    podcast,
    episodes,
    currentPage,
    totalPages,
    isLoading,
    error,
    loadEpisodes,
  } = useSpotifyStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Connect to Spotify
          </h1>
          <button
            onClick={login}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Headphones className="w-5 h-5 mr-2" />
            Login with Spotify
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-gray-600 dark:text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading podcast...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {podcast && (
        <div className="mb-8">
          <div className="flex items-start gap-6">
            {podcast.images?.[0] && (
              <img
                src={podcast.images[0].url}
                alt={podcast.name}
                className="w-32 h-32 rounded-lg shadow-md"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {podcast.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                {podcast.description}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                {podcast.total_episodes} episodes
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {episodes.map((episode, index) => (
          <motion.div
            key={episode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PodcastPlayer episode={episode} />
          </motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => loadEpisodes(i)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === i
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}