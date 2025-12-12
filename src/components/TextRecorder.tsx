import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, StopCircle, RefreshCw, Volume2, Pause } from 'lucide-react';
import RecordRTC from 'recordrtc';
import { transcribeAudio, generateText } from '../utils/openai';

export interface PronunciationFeedback {
  pronunciation: string;
  grammar: string;
  suggestions: string[];
  score?: {
    overall: number;
    pronunciation: number;
    fluency: number;
    accuracy: number;
  };
  problemWords?: Array<{
    word: string;
    issue: string;
    tip: string;
  }>;
  strengths?: string[];
  detailedTips?: string[];
}

interface TextRecorderProps {
  text: string;
  onFeedback: (feedback: PronunciationFeedback) => void;
}

export function TextRecorder({ text, onFeedback }: TextRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const recorderRef = useRef<RecordRTC | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [recordedAudioUrl]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Clean up previous recording
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
        setRecordedAudioUrl(null);
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      }

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

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 30000);
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
      console.error('Microphone access error:', err);
    }
  }, [isRecording, recordedAudioUrl]);

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

        // Create URL for playback
        const audioUrl = URL.createObjectURL(blob);
        setRecordedAudioUrl(audioUrl);

        // Clean up media stream
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }

        try {
          // First, get the transcription from Whisper API
          const transcribedText = await transcribeAudio(blob);

          // Then, get detailed feedback by comparing with the original text
          const prompt = `Analyze this Spanish speech and provide comprehensive pronunciation feedback:

          Original Text: "${text}"
          Transcribed Speech: "${transcribedText}"

          Return response as JSON with this EXACT format:
          {
            "pronunciation": "Overall pronunciation assessment with specific details about accent, clarity, and native-like qualities",
            "grammar": "Grammar analysis and corrections if needed",
            "suggestions": ["Actionable suggestion 1", "Actionable suggestion 2", "Actionable suggestion 3"],
            "score": {
              "overall": 85,
              "pronunciation": 80,
              "fluency": 90,
              "accuracy": 85
            },
            "problemWords": [
              {
                "word": "palabra",
                "issue": "The 'r' sound was too soft",
                "tip": "Roll your tongue more for the Spanish 'r' sound"
              }
            ],
            "strengths": ["Good intonation", "Clear vowel sounds", "Natural rhythm"],
            "detailedTips": [
              "Focus on rolling the 'r' sound in Spanish words",
              "Practice the difference between Spanish 'b' and 'v' sounds",
              "Work on stress patterns in multi-syllable words"
            ]
          }

          Scoring (0-100 scale):
          - overall: Overall performance
          - pronunciation: Clarity and accuracy of sounds
          - fluency: Natural flow and rhythm
          - accuracy: How close to the original text

          Analyze:
          1. Specific pronunciation issues (consonants, vowels, stress patterns)
          2. Words that were mispronounced or unclear
          3. Positive aspects of the pronunciation
          4. Concrete tips for improvement
          5. Accent and intonation patterns
          6. Fluency and natural flow

          Be specific, encouraging, and constructive. Return ONLY the JSON object.`;

          const response = await generateText(prompt, {
            model: 'gpt-3.5-turbo',
            maxTokens: 1000,
            temperature: 0.7,
          });

          const feedback = JSON.parse(response);
          onFeedback(feedback);
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
  }, [text, onFeedback]);

  const togglePlayback = useCallback(() => {
    if (!recordedAudioUrl) return;

    if (isPlaying) {
      // Stop playback
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    } else {
      // Start playback
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }

      const audio = new Audio(recordedAudioUrl);
      audioPlayerRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        audioPlayerRef.current = null;
      };

      audio.onerror = () => {
        setError('Failed to play recording');
        setIsPlaying(false);
        audioPlayerRef.current = null;
      };

      audio.play();
      setIsPlaying(true);
    }
  }, [recordedAudioUrl, isPlaying]);

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <button
          onClick={startRecording}
          disabled={isProcessing}
          className={`p-2 rounded-full transition-colors ${
            isProcessing
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title="Start recording"
        >
          {isProcessing ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors animate-pulse"
          title="Stop recording"
        >
          <StopCircle className="w-5 h-5" />
        </button>
      )}

      {recordedAudioUrl && !isRecording && !isProcessing && (
        <button
          onClick={togglePlayback}
          className={`p-2 rounded-full transition-colors ${
            isPlaying
              ? 'bg-gray-600 hover:bg-gray-700 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title={isPlaying ? 'Stop playback' : 'Play your recording'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}