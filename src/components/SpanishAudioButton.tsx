import { Volume2, Pause, AlertCircle } from 'lucide-react';
import { useSpanishSpeech } from '../hooks/useSpanishSpeech';

interface SpanishAudioButtonProps {
  text: string;
  className?: string;
}

export function SpanishAudioButton({ text, className = '' }: SpanishAudioButtonProps) {
  const { speak, stop, isPlaying, hasVoice } = useSpanishSpeech();

  const handleClick = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(text).catch(error => {
        // Only log non-interruption errors
        if (!error.message.includes('interrupted') && !error.message.includes('canceled')) {
          console.error('Failed to play audio:', error);
        }
      });
    }
  };

  if (!hasVoice) {
    return (
      <button
        disabled
        className={`inline-flex items-center justify-center p-2 rounded-full text-gray-400 dark:text-gray-600 cursor-not-allowed ${className}`}
        title="No Spanish voice available"
      >
        <AlertCircle className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPlaying}
      className={`inline-flex items-center justify-center p-2 rounded-full transition-colors ${
        isPlaying
          ? 'text-indigo-600 dark:text-indigo-400 cursor-not-allowed opacity-70'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      } ${className}`}
      title={isPlaying ? 'Playing audio...' : 'Play audio'}
    >
      {isPlaying ? (
        <Pause className="w-5 h-5 animate-pulse" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
    </button>
  );
}