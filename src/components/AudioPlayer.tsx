import { useState, useRef } from 'react';
import { Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl?: string;
  text?: string;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

export function AudioPlayer({ 
  audioUrl = 'https://ssl.gstatic.com/dictionary/static/pronunciation/2022-03-02/audio/es/hola_es_us_1.mp3',
  text = 'Play audio',
  onPlay,
  onPause,
  className = ''
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        onPause?.();
      };

      audioRef.current.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
        onPause?.();
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Failed to play audio:', error);
        setIsPlaying(false);
        onPause?.();
      });
      setIsPlaying(true);
      onPlay?.();
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={isPlaying}
      className={`inline-flex items-center justify-center gap-2 p-2 rounded-full transition-colors ${
        isPlaying
          ? 'text-indigo-600 dark:text-indigo-400 cursor-not-allowed opacity-70'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      } ${className}`}
      title={isPlaying ? 'Playing audio...' : text}
    >
      {isPlaying ? (
        <Pause className="w-5 h-5 animate-pulse" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
    </button>
  );
}