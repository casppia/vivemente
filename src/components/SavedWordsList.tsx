import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Trash2 } from 'lucide-react';
import { useWordStore } from '../store/useWordStore';
import { generateText } from '../utils/openai';
import { SpanishAudioPlayer } from './SpanishAudioPlayer';

export function SavedWordsList() {
  const { savedWords, removeWord } = useWordStore();
  const [generatedSentences, setGeneratedSentences] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupedWords = savedWords.reduce(
    (acc, word) => {
      acc[word.type].push(word);
      return acc;
    },
    { verb: [], noun: [], adjective: [] } as Record<string, typeof savedWords>
  );

  const generateSentences = async () => {
    if (savedWords.length === 0) return;

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Generate 3 Spanish sentences using these saved words:
      Verbs: ${groupedWords.verb.map(w => w.word).join(', ')}
      Nouns: ${groupedWords.noun.map(w => w.word).join(', ')}
      Adjectives: ${groupedWords.adjective.map(w => w.word).join(', ')}

      Requirements:
      - Use at least one word from each category in each sentence
      - Make sentences natural and contextually appropriate
      - Keep sentences at an intermediate (B1) level
      - Include some variety in tenses and structures
      
      Return ONLY an array of 3 sentences in JSON format, no other text.`;

      const response = await generateText(prompt, {
        model: 'gpt-3.5-turbo',
        maxTokens: 300,
        temperature: 0.7,
      });

      const sentences = JSON.parse(response);
      setGeneratedSentences(sentences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate sentences');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Saved Words
        </h2>
        <button
          onClick={generateSentences}
          disabled={isGenerating || savedWords.length === 0}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isGenerating || savedWords.length === 0
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="inline-block w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Example Sentences'
          )}
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedWords).map(([type, words]) => (
          <div key={type}>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 capitalize">
              {type}s
            </h3>
            <div className="flex flex-wrap gap-2">
              {words.map((word, index) => (
                <div
                  key={index}
                  className={`group relative px-3 py-2 rounded-lg ${
                    type === 'verb'
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : type === 'noun'
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-orange-50 dark:bg-orange-900/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      type === 'verb'
                        ? 'text-blue-700 dark:text-blue-400'
                        : type === 'noun'
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-orange-700 dark:text-orange-400'
                    }`}>
                      {word.word}
                    </span>
                    <button
                      onClick={() => removeWord(word.word)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                  {word.translation && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {word.translation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {generatedSentences.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Example Sentences
            </h3>
            <div className="space-y-4">
              {generatedSentences.map((sentence, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 dark:text-white">{sentence}</p>
                    <SpanishAudioPlayer text={sentence} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}