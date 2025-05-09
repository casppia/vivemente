import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWordStore } from '../store/useWordStore';
import { CEFRLevel } from '../types/level';
import { spanishAnalyzer } from '../utils/nlp';
import { TextStats } from './TextStats';
import { AnalyzedText } from './AnalyzedText';

interface TextAnalysisProps {
  level: CEFRLevel;
  showTranslation: boolean;
}

export function TextAnalysis({ level, showTranslation }: TextAnalysisProps) {
  const [inputText, setInputText] = useState('');
  const [analyzedText, setAnalyzedText] = useState<{
    text: string;
    words: any[];
    level: CEFRLevel;
    translation?: string;
    culturalNotes?: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysis = await spanishAnalyzer.analyzeSentence(inputText);
      
      setAnalyzedText({
        text: inputText,
        words: analysis.words || [],
        level: 'B1', // Default level
        translation: analysis.translation,
        culturalNotes: analysis.culturalNotes
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze text');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTextStats = () => {
    if (!analyzedText?.words) {
      return {
        verbs: 0,
        nouns: 0,
        adjectives: 0,
        total: 0,
      };
    }

    const stats = analyzedText.words.reduce(
      (acc, word) => {
        acc[word.type]++;
        acc.total++;
        return acc;
      },
      { verbs: 0, nouns: 0, adjectives: 0, total: 0 }
    );

    return stats;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Text Analysis
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Enter Spanish text to analyze its components and cultural context
      </p>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="w-full h-32 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white resize-none"
        placeholder="Enter Spanish text here..."
      />
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>
      )}
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || !inputText.trim()}
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
      </button>

      {analyzedText && (
        <div className="mt-8 space-y-6">
          <TextStats stats={getTextStats()} />
          <AnalyzedText
            text={analyzedText.text}
            words={analyzedText.words}
            level={analyzedText.level}
            translation={showTranslation ? analyzedText.translation : undefined}
            culturalNotes={analyzedText.culturalNotes}
          />
        </div>
      )}
    </div>
  );
}