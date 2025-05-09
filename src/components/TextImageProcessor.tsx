import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, Download, AlertCircle, Info } from 'lucide-react';
import { saveAs } from 'file-saver';
import { generateText } from '../utils/openai';
import { spanishAnalyzer } from '../utils/nlp';

interface TextAnalysis {
  verbs: string[];
  nouns: string[];
  collocations: Array<{
    phrase: string;
    explanation: string;
  }>;
  examples: Array<{
    expression: string;
    sentence: string;
    translation: string;
  }>;
  definitions: Array<{
    word: string;
    definition: string;
    synonyms: string[];
  }>;
}

export function TextImageProcessor() {
  const [extractedText, setExtractedText] = useState('');
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Extract text using OpenAI Vision API
      const prompt = `Extract and analyze the Spanish text in this image. 
      Return ONLY the extracted text, no other commentary.`;

      const response = await generateText(prompt, {
        model: 'gpt-4-vision',
        maxTokens: 1000,
        temperature: 0.3,
      });

      setExtractedText(response);

      // Analyze the extracted text
      const analysisPrompt = `Analyze this Spanish text:
      "${response}"
      
      Return a JSON object with:
      {
        "verbs": ["list", "of", "verbs"],
        "nouns": ["list", "of", "nouns"],
        "collocations": [
          {
            "phrase": "collocation or phrase",
            "explanation": "usage explanation"
          }
        ],
        "examples": [
          {
            "expression": "key expression",
            "sentence": "example sentence",
            "translation": "English translation"
          }
        ],
        "definitions": [
          {
            "word": "complex word",
            "definition": "Spanish definition",
            "synonyms": ["synonym1", "synonym2"]
          }
        ]
      }`;

      const analysisResponse = await generateText(analysisPrompt, {
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
      });

      setAnalysis(JSON.parse(analysisResponse));
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleExport = () => {
    if (!extractedText || !analysis) return;

    const exportData = {
      text: extractedText,
      analysis,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    saveAs(blob, 'text-analysis.json');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Text Image Processor
          </h2>
          <button
            onMouseEnter={() => setShowTooltip('info')}
            onMouseLeave={() => setShowTooltip(null)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence>
          {showTooltip === 'info' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-6 mt-2 p-4 bg-gray-900 text-white rounded-lg shadow-lg max-w-xs z-50"
            >
              <p className="text-sm">
                Upload an image containing Spanish text to extract and analyze its content.
                Supported formats: JPG, PNG, PDF
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            {isDragActive
              ? 'Drop the file here'
              : 'Drag & drop an image here, or click to select'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Supported formats: JPG, PNG, PDF
          </p>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {isProcessing && (
          <div className="mt-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">Processing image...</p>
          </div>
        )}

        {extractedText && !isProcessing && (
          <div className="mt-8 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Extracted Text
                </h3>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Analysis
                </button>
              </div>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white resize-none"
              />
            </div>

            {analysis && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Verbs</h4>
                    <ul className="space-y-1">
                      {analysis.verbs.map((verb, index) => (
                        <li key={index} className="text-blue-600 dark:text-blue-300">
                          {verb}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Nouns</h4>
                    <ul className="space-y-1">
                      {analysis.nouns.map((noun, index) => (
                        <li key={index} className="text-green-600 dark:text-green-300">
                          {noun}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-purple-700 dark:text-purple-400 mb-4">
                    Collocations & Phrases
                  </h4>
                  <div className="space-y-4">
                    {analysis.collocations.map((collocation, index) => (
                      <div key={index}>
                        <p className="font-medium text-purple-600 dark:text-purple-300">
                          {collocation.phrase}
                        </p>
                        <p className="text-sm text-purple-500 dark:text-purple-400 mt-1">
                          {collocation.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-orange-700 dark:text-orange-400 mb-4">
                    Example Sentences
                  </h4>
                  <div className="space-y-6">
                    {analysis.examples.map((example, index) => (
                      <div key={index}>
                        <p className="font-medium text-orange-600 dark:text-orange-300">
                          {example.expression}
                        </p>
                        <p className="text-orange-700 dark:text-orange-200 mt-2">
                          {example.sentence}
                        </p>
                        <p className="text-sm text-orange-500 dark:text-orange-400 mt-1">
                          {example.translation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                    Definitions & Synonyms
                  </h4>
                  <div className="space-y-6">
                    {analysis.definitions.map((def, index) => (
                      <div key={index}>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {def.word}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                          {def.definition}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {def.synonyms.map((synonym, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                            >
                              {synonym}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}