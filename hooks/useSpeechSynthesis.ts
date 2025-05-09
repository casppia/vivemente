// useSpeechSynthesis.ts
import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  voicePreference?: string[];
}

interface SpeechSynthesisHook {
  speak: (text: string, options?: SpeechOptions) => void;
  stop: () => void;
  speaking: boolean;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
}

export function useSpeechSynthesis(): SpeechSynthesisHook {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [supported, setSupported] = useState<boolean>(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Check if speech synthesis is supported
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.error("Speech synthesis not supported in this browser");
      setSupported(false);
      return;
    }

    // Function to load and set voices
    const loadVoices = (): void => {
      // Cancel any pending timeouts
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        console.log("Voices loaded:", availableVoices.length);
      } else {
        // If no voices are available, try again in a second
        timeoutRef.current = window.setTimeout(loadVoices, 1000);
      }
    };

    // Initial load
    loadVoices();

    // Set up event listener for Chrome
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Safari and Firefox workaround
    const safariInterval = setInterval(() => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        clearInterval(safariInterval);
      }
    }, 100);

    // Clean up on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      clearInterval(safariInterval);
      if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Firefox & Safari workaround for speech synthesis resume
  useEffect(() => {
    if (!supported || typeof window === 'undefined') return;

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

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [supported]);

  // Speak function
  const speak = useCallback((text: string, options: SpeechOptions = {}): void => {
    if (!supported || typeof window === 'undefined') return;

    // Always stop previous speech first
    stop();
    
    // Short delay to ensure previous speech is fully cancelled
    setTimeout(() => {
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      // Default options
      const defaultOptions: SpeechOptions = {
        lang: 'es-MX',
        rate: 0.9,
        pitch: 1.0,
        voicePreference: ['es-MX', 'es-419', 'es']
      };
      
      const settings = { ...defaultOptions, ...options };
      
      // Set properties
      utterance.lang = settings.lang || 'es-MX';
      utterance.rate = settings.rate || 0.9;
      utterance.pitch = settings.pitch || 1.0;
      
      // Find matching voice
      if (voices.length > 0 && settings.voicePreference) {
        const preferredVoice = voices.find(voice => 
          settings.voicePreference?.some(pref => voice.lang === pref || voice.lang.startsWith(pref))
        );
        
        if (preferredVoice) {
          console.log(`Using voice: ${preferredVoice.name} (${preferredVoice.lang})`);
          utterance.voice = preferredVoice;
        } else {
          console.log(`No preferred voice found. Using default with lang: ${settings.lang}`);
        }
      } else {
        console.log("No voices available yet, using default system voice");
      }
      
      // Set event handlers
      setSpeaking(true);
      
      utterance.onend = () => {
        console.log("Speech ended successfully");
        setSpeaking(false);
        utteranceRef.current = null;
      };
      
      utterance.onerror = (event) => {
        console.error("Speech error:", event);
        
        // Don't treat interruption as a critical error if we caused it
        if (event.error !== 'interrupted') {
          setSpeaking(false);
          utteranceRef.current = null;
        }
      };
      
      // Speak
      console.log("Speaking:", text);
      window.speechSynthesis.speak(utterance);
    }, 50);
  }, [voices, supported, stop]);

  // Stop speaking
  const stop = useCallback((): void => {
    if (!supported || typeof window === 'undefined') return;
    
    console.log("Stopping speech");
    window.speechSynthesis.cancel();
    
    // Only set speaking to false if we have an active utterance
    if (utteranceRef.current) {
      setSpeaking(false);
      utteranceRef.current = null;
    }
  }, [supported]);

  return {
    speak,
    stop,
    speaking,
    supported,
    voices
  };
}