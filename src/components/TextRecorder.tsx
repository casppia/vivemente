import { useState, useRef, useCallback } from 'react';
import { Mic, StopCircle, RefreshCw } from 'lucide-react';
import RecordRTC from 'recordrtc';
import { transcribeAudio, generateText } from '../utils/openai';

interface TextRecorderProps {
  text: string;
  onFeedback: (feedback: {
    pronunciation: string;
    grammar: string;
    suggestions: string[];
  }) => void;
}

export function TextRecorder({ text, onFeedback }: TextRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<RecordRTC | null>(null);
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

          // Then, get feedback by comparing with the original text
          const prompt = `Compare this Spanish speech transcription with the original text and provide feedback:

          Original: "${text}"
          Transcribed: "${transcribedText}"
          
          Return response as JSON with this format:
          {
            "pronunciation": "Detailed feedback about pronunciation and accent",
            "grammar": "Analysis of grammar usage and corrections if needed",
            "suggestions": ["Specific improvement suggestion 1", "Specific improvement suggestion 2"]
          }

          Focus on:
          - Pronunciation accuracy
          - Accent and intonation
          - Grammar correctness
          - Natural flow
          
          Return ONLY the JSON object, no other text.`;

          const response = await generateText(prompt, {
            model: 'gpt-3.5-turbo',
            maxTokens: 500,
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

  return (
    <div className="flex items-center gap-4">
      {!isRecording ? (
        <button
          onClick={startRecording}
          disabled={isProcessing}
          className={`p-3 rounded-full transition-colors ${
            isProcessing
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          title="Start recording"
        >
          {isProcessing ? (
            <RefreshCw className="w-6 h-6 animate-spin" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors animate-pulse"
          title="Stop recording"
        >
          <StopCircle className="w-6 h-6" />
        </button>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}