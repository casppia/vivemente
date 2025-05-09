import { useCallback, useEffect, useRef, useState } from 'react';

interface TTSState {
  isPlaying: boolean;
  error: string | null;
}

export function useTextToSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    error: null,
  });

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Firefox & Safari have a bug where speech synthesis gets paused
    // when not active. This keeps it going
    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.speechSynthesis.pause();
      } else {
        window.speechSynthesis.resume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const speak = useCallback(async (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Always stop previous speech first
        stop();
        
        // Short delay to ensure previous speech is fully cancelled
        setTimeout(() => {
          // Create utterance
          const utterance = new SpeechSynthesisUtterance(text);
          utteranceRef.current = utterance;
          
          // Find Spanish voice (prefer Mexican Spanish)
          const spanishVoice = voices.find(voice => 
            voice.lang === 'es-MX' || 
            voice.lang === 'es-419' ||
            voice.lang.startsWith('es')
          );

          if (spanishVoice) {
            utterance.voice = spanishVoice;
          }

          utterance.lang = 'es-MX';
          utterance.rate = 0.9; // Slightly slower for clarity
          utterance.pitch = 1.0;

          // Setup event handlers
          utterance.onstart = () => {
            setState(prev => ({ ...prev, isPlaying: true, error: null }));
          };

          utterance.onend = () => {
            utteranceRef.current = null;
            setState(prev => ({ ...prev, isPlaying: false }));
            resolve();
          };

          utterance.onerror = (event) => {
            // Don't treat interruption/cancellation as an error
            if (event.error === 'interrupted' || event.error === 'canceled') {
              utteranceRef.current = null;
              setState(prev => ({ ...prev, isPlaying: false }));
              resolve(); // Resolve normally for intentional interruptions
              return;
            }

            console.error('Speech error:', event);
            utteranceRef.current = null;
            setState(prev => ({
              ...prev,
              isPlaying: false,
              error: `Speech synthesis failed: ${event.error}`
            }));
            reject(new Error(`Speech synthesis failed: ${event.error}`));
          };

          // Start speaking
          window.speechSynthesis.speak(utterance);
        }, 50); // Small delay to ensure clean state
      } catch (error) {
        console.error('Speech synthesis error:', error);
        utteranceRef.current = null;
        setState(prev => ({
          ...prev,
          isPlaying: false,
          error: error instanceof Error ? error.message : 'Failed to initialize audio'
        }));
        reject(error);
      }
    });
  }, [voices, stop]);

  return {
    speak,
    stop,
    isPlaying: state.isPlaying,
    error: state.error
  };
}