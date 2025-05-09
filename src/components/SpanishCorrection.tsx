import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw } from 'lucide-react';
import { generateText } from '../utils/openai';

interface SpanishCorrectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpanishCorrection({ isOpen, onClose }: SpanishCorrectionProps) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [correction, setCorrection] = useState<CorrectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl w-full max-w-lg mx-4 my-8 flex flex-col max-h-[90vh]">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-gray-900 rounded-t-xl border-b border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Spanish Correction</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
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
              className={`w-full flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                isProcessing || !inputText.trim()
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Check Text'
              )}
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {correction && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Corrected Text
                  </h3>
                  <p className="text-white">{correction.correctedText}</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Explanation
                  </h3>
                  <p className="text-white">{correction.explanation}</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {correction.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-white">• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 z-10 bg-gray-900 rounded-b-xl border-t border-gray-800 p-6">
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

interface CorrectionResult {
  correctedText: string;
  explanation: string;
  suggestions: string[];
}