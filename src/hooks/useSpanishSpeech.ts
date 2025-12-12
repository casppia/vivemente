import { useCallback, useEffect, useRef, useState } from 'react';

interface SpanishSpeechOptions {
  rate?: number;
  pitch?: number;
}

interface SpanishSpeechState {
  isPlaying: boolean;
  error: string | null;
}

export function useSpanishSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [state, setState] = useState<SpanishSpeechState>({
    isPlaying: false,
    error: null,
  });

  // Load and initialize voices
  useEffect(() => {
    function getGoogleSpanishVoice(): SpeechSynthesisVoice | null {
      const allVoices = window.speechSynthesis.getVoices();
      
      // First try to find Google Spanish Mexican voice
      let voice = allVoices.find(v => 
        v.name.toLowerCase().includes('google') && 
        v.lang === 'es-MX'
      );

      // Then try any Google Spanish voice
      if (!voice) {
        voice = allVoices.find(v => 
          v.name.toLowerCase().includes('google') && 
          v.lang.startsWith('es')
        );
      }

      // Finally, try any Spanish voice
      if (!voice) {
        voice = allVoices.find(v => v.lang.startsWith('es'));
      }

      return voice || null;
    }

    function loadVoices() {
      const voice = getGoogleSpanishVoice();
      if (voice) {
        console.log('Selected voice:', {
          name: voice.name,
          lang: voice.lang,
          isGoogle: voice.name.toLowerCase().includes('google')
        });
        setVoices([voice]);
      } else {
        console.warn('No suitable Spanish voice found');
      }
    }

    // Initial load attempt
    loadVoices();

    // Chrome requires this event listener
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Safari/Firefox workaround
    const interval = setInterval(() => {
      const voice = getGoogleSpanishVoice();
      if (voice) {
        loadVoices();
        clearInterval(interval);
      }
    }, 100);

    // Cleanup
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      clearInterval(interval);
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle visibility changes
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        if (utteranceRef.current) {
          window.speechSynthesis.pause();
        }
      } else {
        if (utteranceRef.current) {
          window.speechSynthesis.resume();
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const speak = useCallback(async (text: string, options: SpanishSpeechOptions = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Always stop any ongoing speech
        stop();

        // Small delay to ensure speech synthesis is fully stopped
        setTimeout(() => {
          try {
            // Ensure we have a voice
            if (!voices.length) {
              throw new Error('No Spanish voice available');
            }

            // Create new utterance
            const utterance = new SpeechSynthesisUtterance(text);
            utteranceRef.current = utterance;

            // Configure utterance
            utterance.voice = voices[0];
            utterance.lang = 'es-MX';
            utterance.rate = options.rate ?? 0.9;
            utterance.pitch = options.pitch ?? 1.0;
            utterance.volume = 1.0;

            // Event handlers
            utterance.onstart = () => {
              setState(prev => ({ ...prev, isPlaying: true, error: null }));
              console.log('Speech started:', {
                voice: utterance.voice?.name,
                lang: utterance.voice?.lang
              });
            };

            utterance.onend = () => {
              utteranceRef.current = null;
              setState(prev => ({ ...prev, isPlaying: false }));
              console.log('Speech completed successfully');
              resolve();
            };

            utterance.onerror = (event) => {
              console.error('Speech error:', event);

              // Handle interruption separately
              if (event.error === 'interrupted' || event.error === 'canceled') {
                utteranceRef.current = null;
                setState(prev => ({ ...prev, isPlaying: false }));
                resolve();
                return;
              }

              // Handle other errors
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
          } catch (error) {
            console.error('Speech synthesis initialization error:', error);
            utteranceRef.current = null;
            setState(prev => ({
              ...prev,
              isPlaying: false,
              error: error instanceof Error ? error.message : 'Failed to initialize speech'
            }));
            reject(error);
          }
        }, 50);

      } catch (error) {
        console.error('Speech synthesis initialization error:', error);
        utteranceRef.current = null;
        setState(prev => ({
          ...prev,
          isPlaying: false,
          error: error instanceof Error ? error.message : 'Failed to initialize speech'
        }));
        reject(error);
      }
    });
  }, [voices, stop]);

  return {
    speak,
    stop,
    isPlaying: state.isPlaying,
    error: state.error,
    hasVoice: voices.length > 0
  };
}