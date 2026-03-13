import React, { useState } from 'react';
import { Volume2, Mic, StopCircle, RefreshCw, VolumeX, Play, Pause, Loader2 } from 'lucide-react';
import RecordRTC from 'recordrtc';
import { generateText } from '../utils/openai';
import { generateSpeech, isElevenLabsAvailable, getDefaultSpanishVoices } from '../utils/elevenLabs';

interface SpanishCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CorrectionResult {
  correctedText: string;
  explanation: string;
  suggestions: string[];
}

export function SpanishCorrectionModal({ isOpen, onClose }: SpanishCorrectionModalProps) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [correction, setCorrection] = useState<CorrectionResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const hasElevenLabs = isElevenLabsAvailable();

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to correct');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const prompt = `Correct this Spanish text and provide feedback:
      "${inputText}"
      
      Return response as JSON with this format:
      {
        "correctedText": "The corrected Spanish text",
        "explanation": "Explanation of the corrections made",
        "suggestions": [
          "Improvement suggestion 1",
          "Improvement suggestion 2"
        ]
      }`;

      const response = await generateText(prompt, {
        model: 'gpt-3.5-turbo',
        maxTokens: 500,
        temperature: 0.7,
      });

      const result = JSON.parse(response);
      setCorrection(result);
    } catch (err) {
      setError('Failed to process text. Please try again.');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = async (text: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      setIsPlaying(true);
      audio.play();
      return;
    }

    setAudioLoading(true);

    try {
      if (hasElevenLabs) {
        // Use ElevenLabs with Mexican female voice (Charlotte)
        const voices = getDefaultSpanishVoices();
        const mexicanVoice = voices.find(v => v.name.includes('Charlotte')) || voices[0];
        const blob = await generateSpeech(text, mexicanVoice.voice_id);

        if (blob) {
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          const audio = new Audio(url);
          audio.onended = () => setIsPlaying(false);
          setIsPlaying(true);
          audio.play();
          setAudioLoading(false);
          return;
        }
      }

      // Fallback to Web Speech API
      if (!window.speechSynthesis) {
        setError('Speech synthesis is not supported in your browser');
        setAudioLoading(false);
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-MX';
      utterance.rate = playbackSpeed;

      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(voice =>
        voice.lang === 'es-MX' || voice.lang === 'es-ES' || voice.lang.startsWith('es')
      );

      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        setError('Error playing audio');
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Error playing audio');
    } finally {
      setAudioLoading(false);
    }
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (!correction) return;

    if (isPlaying) {
      stopAudio();
    } else {
      playAudio(correction.correctedText);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Fixed Header */}
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Spanish Correction</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your Spanish text here..."
              className="w-full h-32 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none"
            />

            <button
              onClick={handleSubmit}
              disabled={isProcessing || !inputText.trim()}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
                isProcessing || !inputText.trim()
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-indigo-500 hover:bg-indigo-600'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Check Text'
              )}
            </button>

            {correction && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-400">Corrected Text</h3>
                    <div className="flex items-center gap-2">
                      {!hasElevenLabs && (
                        <select
                          value={playbackSpeed}
                          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                          className="bg-gray-700 text-white text-sm rounded px-2 py-1 [&>option]:bg-gray-700 [&>option]:text-white"
                        >
                          <option value={0.5} className="bg-gray-700 text-white">0.5x Speed</option>
                          <option value={0.75} className="bg-gray-700 text-white">0.75x Speed</option>
                          <option value={1} className="bg-gray-700 text-white">Normal Speed</option>
                        </select>
                      )}
                      <button
                        onClick={togglePlayback}
                        disabled={audioLoading}
                        className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        title="Listen to pronunciation"
                      >
                        {audioLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-white">{correction.correctedText}</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Explanation</h3>
                  <p className="text-white">{correction.explanation}</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Suggestions</h3>
                  <ul className="space-y-2">
                    {correction.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-white">• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}