import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, Download, AlertCircle, Info, Volume2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import { generateText } from '../utils/openai';
import { SpanishAudioPlayer } from './SpanishAudioPlayer';
import OpenAI from 'openai';

interface ImageDescription {
  beginner: string;
  intermediate: string;
  advanced: string;
}

export function TextImageProcessor() {
  const [descriptions, setDescriptions] = useState<ImageDescription | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setDescriptions(null);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setUploadedImage(base64);

      // Initialize OpenAI client
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key is missing');
      }

      const client = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });

      // Generate descriptions at 3 levels using GPT-4 Vision
      const prompt = `Describe this image in Spanish at three different proficiency levels.

      Return ONLY a valid JSON object in this exact format (no markdown, no code blocks):
      {
        "beginner": "A1-A2 level description using simple present tense, basic vocabulary, short sentences (2-3 sentences)",
        "intermediate": "B1-B2 level description using varied tenses, common idioms, moderate vocabulary (3-4 sentences)",
        "advanced": "C1-C2 level description using complex structures, subjunctive, rich vocabulary, sophisticated expressions (4-5 sentences)"
      }`;

      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: base64,
                  detail: 'high'
                },
              },
            ],
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedDescriptions = JSON.parse(cleanedContent) as ImageDescription;

      setDescriptions(parsedDescriptions);
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
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleExport = () => {
    if (!descriptions) return;

    const exportData = {
      descriptions,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    saveAs(blob, 'image-descriptions.json');
  };

  const handleReset = () => {
    setDescriptions(null);
    setUploadedImage(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Image Description Generator
          </h2>
          <div className="flex items-center gap-2">
            {descriptions && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                New Image
              </button>
            )}
            <button
              onMouseEnter={() => setShowTooltip('info')}
              onMouseLeave={() => setShowTooltip(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
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
                Upload any image to get Spanish descriptions at three proficiency levels: Beginner (A1-A2), Intermediate (B1-B2), and Advanced (C1-C2).
                Supported formats: JPG, PNG, WEBP
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!descriptions && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              {isDragActive
                ? 'Drop the image here'
                : 'Drag & drop an image here, or click to select'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Supported formats: JPG, PNG, WEBP
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {isProcessing && (
          <div className="mt-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600 dark:text-blue-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">Analyzing image and generating descriptions...</p>
          </div>
        )}

        {descriptions && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            {uploadedImage && (
              <div className="flex justify-center">
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="max-w-full max-h-96 rounded-lg shadow-md object-contain"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Spanish Descriptions
              </h3>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            <div className="space-y-6">
              {/* Beginner Level */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-green-800 dark:text-green-300">
                      Beginner Level
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-400">A1-A2 · Simple vocabulary & present tense</p>
                  </div>
                </div>
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed mb-3">
                  {descriptions.beginner}
                </p>
                <SpanishAudioPlayer text={descriptions.beginner} className="mt-4" />
              </div>

              {/* Intermediate Level */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                      Intermediate Level
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">B1-B2 · Varied tenses & common idioms</p>
                  </div>
                </div>
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed mb-3">
                  {descriptions.intermediate}
                </p>
                <SpanishAudioPlayer text={descriptions.intermediate} className="mt-4" />
              </div>

              {/* Advanced Level */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-300">
                      Advanced Level
                    </h4>
                    <p className="text-sm text-orange-600 dark:text-orange-400">C1-C2 · Complex structures & subjunctive</p>
                  </div>
                </div>
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed mb-3">
                  {descriptions.advanced}
                </p>
                <SpanishAudioPlayer text={descriptions.advanced} className="mt-4" />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}