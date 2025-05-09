import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { SpotifyEpisode } from '../types/spotify';

interface Props {
  episode: SpotifyEpisode;
}

export function PodcastPlayer({ episode }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audio] = useState(new Audio(episode.audio_preview_url || ''));

  useEffect(() => {
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [audio]);

  const handleTimeUpdate = () => {
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    const newTime = percent * audio.duration;
    audio.currentTime = newTime;
    setProgress(percent * 100);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-start gap-4 mb-4">
        <img
          src={episode.images[0]?.url}
          alt={episode.name}
          className="w-20 h-20 rounded-lg"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {episode.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(episode.release_date)} • {formatTime(episode.duration_ms)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
            {episode.description}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div
          className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
          onClick={handleSeek}
        >
          <motion.div
            className="h-full bg-indigo-600 rounded-full"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            onClick={() => {
              audio.currentTime = Math.max(0, audio.currentTime - 10);
            }}
          >
            <SkipBack size={24} />
          </button>

          <button
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            onClick={() => {
              audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
            }}
          >
            <SkipForward size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}