import React, { useState, useRef, useCallback } from 'react';
import { Volume2, Mic, StopCircle, RefreshCw, VolumeX, Play, Pause } from 'lucide-react';
import RecordRTC from 'recordrtc';
import { generateText } from '../utils/openai';

interface SpanishCorrectionProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CorrectionResult {
  correctedText: string;
  explanation: string;
  suggestions: string[];
}

export function SpanishCorrection({ isOpen, onClose }: SpanishCorrectionProps) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [correction, setCorrection] = useState<CorrectionResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<RecordRTC | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        timeSlice: 1000,
        desiredSampRate: 16000,
      });

      recorderRef.current.startRecording();
      setIsRecording(true);
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
      console.error('Microphone access error:', err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recorderRef.current) return;

    setIsRecording(false);
    setIsProcessing(true);

    try {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current?.getBlob();
        if (!blob) {
          throw new Error('No recording data available');
        }

        // Clean up media stream
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }

        // Convert blob to text using Web Speech API
        const reader = new FileReader();
        reader.onload = async () => {
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
        reader.readAsText(blob);
      });
    } catch (err) {
      setError('Failed to process recording. Please try again.');
      setIsProcessing(false);
      console.error('Recording error:', err);
    }
  }, [inputText]);

  const handleTextSubmit = async () => {
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

  const playAudio = useCallback((text: string, speed: number = 1) => {
    if (!window.speechSynthesis) {
      setError('Speech synthesis is not supported in your browser');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = speed;

    // Get Spanish voice
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
  }, []);

  const stopAudio = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const togglePlayback = useCallback(() => {
    if (!correction) return;
    
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio(correction.correctedText, playbackSpeed);
    }
  }, [correction, isPlaying, playbackSpeed, playAudio, stopAudio]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-8 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-6">Spanish Correction</h2>

        <div className="space-y-6">
          {/* Input Section */}
          <div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your Spanish text here..."
              className="w-full h-32 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none"
            />
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleTextSubmit}
                disabled={isProcessing || !inputText.trim()}
                className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="inline-block w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Check Text'
                )}
              </button>
              <button
                onClick={startRecording}
                disabled={isRecording || isProcessing}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="flex items-center justify-center gap-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-gray-400">Recording...</span>
              <button
                onClick={stopRecording}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <StopCircle className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Correction Results */}
          {correction && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Corrected Text</h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                      className="bg-gray-700 text-white text-sm rounded px-2 py-1"
                    >
                      <option value={0.5}>0.5x Speed</option>
                      <option value={0.75}>0.75x Speed</option>
                      <option value={1}>Normal Speed</option>
                    </select>
                    <button
                      onClick={togglePlayback}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      {isPlaying ? (
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

              <button
                onClick={() => {
                  setInputText('');
                  setCorrection(null);
                }}
                className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                Try Another
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}