import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Pause, Settings2, X, Loader2 } from 'lucide-react';
import { generateSpeech, isElevenLabsAvailable, getDefaultSpanishVoices } from '../utils/elevenLabs';

interface SpanishAudioPlayerProps {
  text: string;
  className?: string;
}

interface SpeechSettings {
  rate: number;
  pitch: number;
  volume: number;
  voiceURI: string;
  elevenLabsVoiceId: string;
}

const MAX_CHUNK_LENGTH = 200;

// Global audio manager to handle single audio playback
const audioManager = {
  currentPlayer: null as AudioPlayerInstance | null,
  setCurrentPlayer(player: AudioPlayerInstance | null) {
    if (this.currentPlayer && this.currentPlayer !== player) {
      this.currentPlayer.stop();
    }
    this.currentPlayer = player;
  }
};

class AudioPlayerInstance {
  private utterance: SpeechSynthesisUtterance | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying = false;
  private isLoading = false;
  private onPlayStateChange: (isPlaying: boolean) => void;
  private onLoadingStateChange: (isLoading: boolean) => void;

  constructor(
    onPlayStateChange: (isPlaying: boolean) => void,
    onLoadingStateChange: (isLoading: boolean) => void
  ) {
    this.onPlayStateChange = onPlayStateChange;
    this.onLoadingStateChange = onLoadingStateChange;
  }

  async play(text: string, voice: SpeechSynthesisVoice | null, settings: SpeechSettings) {
    if (this.isPlaying || this.isLoading) {
      this.stop();
      return;
    }

    audioManager.setCurrentPlayer(this);
    this.isLoading = true;
    this.onLoadingStateChange(true);

    // Try ElevenLabs first if available
    if (isElevenLabsAvailable()) {
      console.log('Attempting to use ElevenLabs audio...');
      try {
        const audioBlob = await generateSpeech(text, settings.elevenLabsVoiceId);
        if (audioBlob) {
          console.log('Playing ElevenLabs audio');
          this.isLoading = false;
          this.onLoadingStateChange(false);
          this.playAudioBlob(audioBlob, settings.volume);
          return;
        } else {
          console.log('ElevenLabs returned null, falling back to Web Speech API');
        }
      } catch (error) {
        console.error('ElevenLabs failed, falling back to Web Speech API:', error);
      }
    } else {
      console.log('Using Web Speech API (ElevenLabs not available)');
    }

    // Fallback to Web Speech API
    this.isLoading = false;
    this.onLoadingStateChange(false);
    this.playSpeechSynthesis(text, voice, settings);
  }

  private playAudioBlob(blob: Blob, volume: number) {
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    this.audioElement = audio;
    audio.volume = volume;

    this.isPlaying = true;
    this.onPlayStateChange(true);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      this.isPlaying = false;
      this.audioElement = null;
      this.onPlayStateChange(false);
      audioManager.setCurrentPlayer(null);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      this.isPlaying = false;
      this.audioElement = null;
      this.onPlayStateChange(false);
      audioManager.setCurrentPlayer(null);
    };

    audio.play();
  }

  private playSpeechSynthesis(text: string, voice: SpeechSynthesisVoice | null, settings: SpeechSettings) {
    const utterance = new SpeechSynthesisUtterance(text);
    this.utterance = utterance;

    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = voice?.lang || 'es-MX';
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    utterance.onstart = () => {
      this.isPlaying = true;
      this.onPlayStateChange(true);
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.utterance = null;
      this.onPlayStateChange(false);
      audioManager.setCurrentPlayer(null);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isPlaying = false;
      this.utterance = null;
      this.onPlayStateChange(false);
      audioManager.setCurrentPlayer(null);
    };

    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
      this.isPlaying = false;
      this.isLoading = false;
      this.onPlayStateChange(false);
      this.onLoadingStateChange(false);
      audioManager.setCurrentPlayer(null);
    }

    if (this.utterance) {
      window.speechSynthesis.cancel();
      this.isPlaying = false;
      this.isLoading = false;
      this.utterance = null;
      this.onPlayStateChange(false);
      this.onLoadingStateChange(false);
      audioManager.setCurrentPlayer(null);
    }

    if (this.isLoading) {
      this.isLoading = false;
      this.onLoadingStateChange(false);
      audioManager.setCurrentPlayer(null);
    }
  }
}

export function SpanishAudioPlayer({ text, className = '' }: SpanishAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<SpeechSettings>({
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
    voiceURI: '',
    elevenLabsVoiceId: getDefaultSpanishVoices()[1]?.voice_id || ''
  });
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVoicesLoaded, setIsVoicesLoaded] = useState(false);
  const playerRef = useRef<AudioPlayerInstance | null>(null);

  // Initialize the player
  useEffect(() => {
    playerRef.current = new AudioPlayerInstance(
      (playing) => setIsPlaying(playing),
      (loading) => setIsLoading(loading)
    );
    return () => {
      if (playerRef.current) {
        playerRef.current.stop();
      }
    };
  }, []);

  // Load voices with retry mechanism
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;
    const retryInterval = 1000; // 1 second

    function loadVoices() {
      const availableVoices = window.speechSynthesis.getVoices();
      const spanishVoices = availableVoices
        .filter(voice => voice.lang.startsWith('es'))
        .sort((a, b) => {
          if (a.lang === 'es-MX') return -1;
          if (b.lang === 'es-MX') return 1;
          if (a.lang === 'es-419') return -1;
          if (b.lang === 'es-419') return 1;
          return 0;
        });

      if (spanishVoices.length > 0) {
        console.log('Spanish voices loaded:', spanishVoices.map(v => `${v.name} (${v.lang})`));
        setVoices(spanishVoices);
        if (!settings.voiceURI) {
          setSettings(prev => ({ ...prev, voiceURI: spanishVoices[0].voiceURI }));
        }
        setIsVoicesLoaded(true);
        return true;
      }

      return false;
    }

    function attemptLoadVoices() {
      if (loadVoices()) return;

      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(attemptLoadVoices, retryInterval);
      } else {
        console.warn('Failed to load Spanish voices after retries');
        // Fall back to using any available voice
        const anyVoices = window.speechSynthesis.getVoices();
        if (anyVoices.length > 0) {
          setVoices(anyVoices);
          setSettings(prev => ({ ...prev, voiceURI: anyVoices[0].voiceURI }));
          setIsVoicesLoaded(true);
        }
      }
    }

    // Initial attempt
    attemptLoadVoices();

    // Set up voice change listener
    window.speechSynthesis.onvoiceschanged = () => {
      retryCount = 0; // Reset retry count when voices change
      attemptLoadVoices();
    };

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [settings.voiceURI]);

  // Chrome fix for speech synthesis timeout
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (isPlaying) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const isProcessingRef = useRef(false);

  const togglePlayPause = useCallback(() => {
    // Prevent multiple rapid clicks
    if (!isVoicesLoaded || isProcessingRef.current) {
      if (!isVoicesLoaded) {
        console.warn('Voices not loaded yet');
      }
      return;
    }

    const selectedVoice = voices.find(v => v.voiceURI === settings.voiceURI) || voices[0];

    // Clean the text: remove blanks, extra spaces, and placeholders
    const cleanText = text
      .replace(/_+/g, '') // Remove underscores
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    if (playerRef.current) {
      if (isPlaying || isLoading) {
        playerRef.current.stop();
      } else {
        isProcessingRef.current = true;
        playerRef.current.play(cleanText, selectedVoice, settings);
        // Reset processing flag after a short delay to allow state to update
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 300);
      }
    }
  }, [isVoicesLoaded, voices, settings, text, isPlaying, isLoading]);

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlayPause}
          disabled={!isVoicesLoaded || isLoading}
          className={`inline-flex items-center justify-center p-2 rounded-full transition-colors ${
            !isVoicesLoaded || isLoading
              ? 'opacity-50 cursor-not-allowed text-gray-600 dark:text-gray-400'
              : isPlaying
              ? 'text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          } ${className}`}
          title={
            isLoading
              ? 'Generating audio...'
              : isPlaying
              ? 'Pause audio'
              : !isVoicesLoaded
              ? 'Loading voices...'
              : 'Play audio'
          }
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          disabled={!isVoicesLoaded}
          className={`p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors ${
            !isVoicesLoaded ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Audio settings"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 min-w-[240px] z-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Audio Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {isElevenLabsAvailable() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Voice
                  </label>
                  <select
                    value={settings.elevenLabsVoiceId}
                    onChange={(e) => {
                      setSettings(prev => ({ ...prev, elevenLabsVoiceId: e.target.value }));
                      setShowSettings(false);
                    }}
                    className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white [&>option]:bg-white [&>option]:dark:bg-gray-700 [&>option]:text-gray-900 [&>option]:dark:text-white"
                  >
                    <optgroup label="Female Voices">
                      {getDefaultSpanishVoices().filter(v => v.category === 'female').map(voice => (
                        <option key={voice.voice_id} value={voice.voice_id} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          {voice.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Male Voices">
                      {getDefaultSpanishVoices().filter(v => v.category === 'male').map(voice => (
                        <option key={voice.voice_id} value={voice.voice_id} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          {voice.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}

              {!isElevenLabsAvailable() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Voice
                  </label>
                  <select
                    value={settings.voiceURI}
                    onChange={(e) => setSettings(prev => ({ ...prev, voiceURI: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white [&>option]:bg-white [&>option]:dark:bg-gray-700 [&>option]:text-gray-900 [&>option]:dark:text-white"
                  >
                    {voices.map(voice => (
                      <option key={voice.voiceURI} value={voice.voiceURI} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!isElevenLabsAvailable() && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Speed: {settings.rate}x
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={settings.rate}
                      onChange={(e) => setSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pitch: {settings.pitch}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={settings.pitch}
                      onChange={(e) => setSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Volume: {Math.round(settings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => setSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}