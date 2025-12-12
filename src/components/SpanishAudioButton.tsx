import { useRef } from 'react';
import { Volume2, Pause, AlertCircle } from 'lucide-react';
import { useSpanishSpeech } from '../hooks/useSpanishSpeech';

interface SpanishAudioButtonProps {
  text: string;
  className?: string;
}

export function SpanishAudioButton({ text, className = '' }: SpanishAudioButtonProps) {
  const { speak, stop, isPlaying, hasVoice } = useSpanishSpeech();
  const isProcessingRef = useRef(false);

  const handleClick = async () => {
    // Prevent multiple rapid clicks
    if (isProcessingRef.current) return;

    if (isPlaying) {
      stop();
    } else {
      isProcessingRef.current = true;
      try {
        await speak(text);
      } catch (error: any) {
        // Only log non-interruption errors
        if (!error.message.includes('interrupted') && !error.message.includes('canceled')) {
          console.error('Failed to play audio:', error);
        }
      } finally {
        isProcessingRef.current = false;
      }
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
      className={`inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
        isPlaying ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
      } ${className}`}
      title={isPlaying ? 'Pause audio' : 'Play audio'}
    >
      {isPlaying ? (
        <Pause className="w-5 h-5" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
    </button>
  );
}