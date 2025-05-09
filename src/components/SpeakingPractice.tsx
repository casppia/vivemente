import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, StopCircle, X, Loader2, Volume2 } from 'lucide-react';
import RecordRTC from 'recordrtc';
import { generateText, transcribeAudio } from '../utils/openai';

interface SpeakingPracticeProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackResponse {
  transcription: string;
  feedback: {
    pronunciation: string;
    grammar: string;
    suggestions: string[];
  };
  examples: Array<{
    spanish: string;
    english: string;
    explanation: string;
  }>;
}

export function SpeakingPractice({ isOpen, onClose }: SpeakingPracticeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [feedback, setFeedback] = useState<FeedbackResponse['feedback'] | null>(null);
  const [examples, setExamples] = useState<FeedbackResponse['examples']>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const recorderRef = useRef<RecordRTC | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Reset all states and cleanup when modal closes
  const handleClose = useCallback(() => {
    // Stop recording if active
    if (isRecording && recorderRef.current) {
      recorderRef.current.stopRecording();
    }

    // Stop and cleanup media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Reset recorder
    if (recorderRef.current) {
      recorderRef.current = null;
    }

    // Reset all states
    setIsRecording(false);
    setIsProcessing(false);
    setTranscription('');
    setFeedback(null);
    setExamples([]);
    setError(null);
    setIsPlaying(null);

    // Call parent onClose
    onClose();
  }, [isRecording, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recorderRef.current) {
        recorderRef.current = null;
      }
    };
  }, []);

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

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 60000);
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
      console.error('Microphone access error:', err);
    }
  }, [isRecording]);

  const stopRecording = useCallback(async () => {
    if (!recorderRef.current) return;

    setIsRecording(false);
    setIsProcessing(true);

    try {
      recorderRef.current.stopRecording(async () => {
        const blob = recorderRef.current?.getBlob();
        if (!blob) {
          throw new Error('No recording data available');
        }

        // Clean up media stream
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }

        try {
          // First, get the transcription from Whisper API
          const transcribedText = await transcribeAudio(blob);

          // Then, get feedback on the transcribed text
          const prompt = `Analyze this Spanish speech and provide feedback with example sentences:
          "${transcribedText}"
          
          Return response as JSON with this format:
          {
            "transcription": "${transcribedText}",
            "feedback": {
              "pronunciation": "Detailed feedback about pronunciation and accent",
              "grammar": "Analysis of grammar usage and corrections if needed",
              "suggestions": ["Specific improvement suggestion 1", "Specific improvement suggestion 2"]
            },
            "examples": [
              {
                "spanish": "Example sentence showing correct usage",
                "english": "English translation",
                "explanation": "Why this is a good example"
              },
              {
                "spanish": "Another example sentence",
                "english": "English translation",
                "explanation": "Explanation of the correct usage"
              }
            ]
          }

          Requirements:
          - Provide 2-3 example sentences that demonstrate correct usage
          - Make examples relevant to any corrections needed
          - Include clear explanations of why each example is helpful
          - Keep examples at an intermediate level
          - Use natural, everyday Mexican Spanish`;

          const response = await generateText(prompt, {
            model: 'gpt-3.5-turbo',
            maxTokens: 800,
            temperature: 0.7,
          });

          const result = JSON.parse(response) as FeedbackResponse;
          setTranscription(result.transcription);
          setFeedback(result.feedback);
          setExamples(result.examples);
        } catch (err) {
          setError('Failed to process speech. Please try again.');
          console.error('Processing error:', err);
        } finally {
          setIsProcessing(false);
        }
      });
    } catch (err) {
      setError('Failed to process recording. Please try again.');
      setIsProcessing(false);
      console.error('Recording error:', err);
    }
  }, []);

  const playAudio = useCallback((text: string, index: number) => {
    if (!window.speechSynthesis) {
      setError('Speech synthesis is not supported in your browser');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    setIsPlaying(null);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = 0.9;

    // Get Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice => 
      voice.lang === 'es-MX' || voice.lang === 'es-ES' || voice.lang.startsWith('es')
    );
    
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onstart = () => setIsPlaying(index);
    utterance.onend = () => setIsPlaying(null);
    utterance.onerror = () => {
      setIsPlaying(null);
      setError('Error playing audio');
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const resetStates = useCallback(() => {
    setTranscription('');
    setFeedback(null);
    setExamples([]);
    setError(null);
    setIsPlaying(null);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-8 max-w-lg w-full mx-4 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Speaking Practice</h2>

        <div className="space-y-6">
          {!isRecording && !isProcessing && !transcription && (
            <div className="text-center">
              <button
                onClick={startRecording}
                className="p-6 bg-indigo-500 hover:bg-indigo-600 rounded-full text-white transition-colors"
              >
                <Mic className="w-8 h-8" />
              </button>
              <p className="text-gray-400 mt-4">Click to start recording</p>
            </div>
          )}

          {isRecording && (
            <div className="text-center">
              <button
                onClick={stopRecording}
                className="p-6 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors animate-pulse"
              >
                <StopCircle className="w-8 h-8" />
              </button>
              <p className="text-gray-400 mt-4">Recording... Click to stop</p>
            </div>
          )}

          {isProcessing && (
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-gray-400 mt-4">Processing your speech...</p>
            </div>
          )}

          {transcription && feedback && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Your Speech</h3>
                <p className="text-white">{transcription}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Pronunciation</h3>
                  <p className="text-white">{feedback.pronunciation}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Grammar</h3>
                  <p className="text-white">{feedback.grammar}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Suggestions</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {feedback.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-white">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {examples.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-4">Example Sentences</h3>
                  <div className="space-y-4">
                    {examples.map((example, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-white">{example.spanish}</p>
                          <button
                            onClick={() => playAudio(example.spanish, index)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                          >
                            <Volume2 className={`w-5 h-5 ${isPlaying === index ? 'text-indigo-400' : ''}`} />
                          </button>
                        </div>
                        <p className="text-gray-400 text-sm">{example.english}</p>
                        <p className="text-indigo-400 text-sm italic">{example.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={resetStates}
                className="w-full px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

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