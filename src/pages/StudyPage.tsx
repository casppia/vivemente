import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, BookOpen, CheckCircle, Clock, Filter, SortAsc, Settings2, ArrowLeft, RefreshCw } from 'lucide-react';
import { CEFR_LEVELS } from '../types/level';
import { useWordStore } from '../store/useWordStore';
import { SpanishAudioPlayer } from '../components/SpanishAudioPlayer';
import { generateText } from '../utils/openai';

type Tab = 'saved' | 'conjugated' | 'learned';
type SortOption = 'date' | 'alphabetical' | 'source';
type FilterOption = 'all' | 'verbs' | 'nouns' | 'adjectives' | 'topics' | 'generator' | 'analyzer';
type TenseOption = 'all' | 'present' | 'past' | 'future';

interface GenerateOptions {
  tense: TenseOption;
  count: number;
  showOptions: boolean;
}

interface Example {
  spanish: string;
  english: string;
  note?: string;
  conjugation?: {
    verb: string;
    infinitive: string;
    tense: string;
    explanation: string;
  }[];
}

interface WordWithExamples extends SavedWord {
  examples?: Example[];
  isGenerating?: boolean;
  error?: string;
  generateOptions?: GenerateOptions;
}

export default function StudyPage() {
  const { savedWords, markAsLearned, markAsUnlearned } = useWordStore();
  const [activeTab, setActiveTab] = useState<Tab>('saved');
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});
  const [words, setWords] = useState<WordWithExamples[]>(
    savedWords.map(word => ({
      ...word,
      generateOptions: {
        tense: 'all',
        count: 3,
        showOptions: false,
      },
    }))
  );

  useEffect(() => {
    setWords(savedWords.map(word => ({
      ...word,
      generateOptions: {
        tense: 'all',
        count: 3,
        showOptions: false,
      },
    })));
  }, [savedWords]);

  const toggleGenerateOptions = (wordId: string) => {
    setWords(words.map(w =>
      w.word === wordId
        ? { ...w, generateOptions: { ...w.generateOptions!, showOptions: !w.generateOptions!.showOptions } }
        : w
    ));
  };

  const updateGenerateOptions = (wordId: string, options: Partial<GenerateOptions>) => {
    setWords(words.map(w =>
      w.word === wordId
        ? { ...w, generateOptions: { ...w.generateOptions!, ...options } }
        : w
    ));
  };

  const generateExamples = async (word: WordWithExamples) => {
    setWords(words.map(w => 
      w.word === word.word 
        ? { ...w, isGenerating: true, error: undefined }
        : w
    ));

    try {
      let prompt;
      
      if (word.conjugation) {
        prompt = `Generate ${word.generateOptions?.count || 3} Spanish sentences using ONLY the exact conjugated verb form "${word.word}" (${word.conjugation.person}) at ${word.level} level.

        Requirements:
        - Use EXACTLY the verb form "${word.word}" in each sentence - do not use any other conjugations
        - Make sentences natural and contextually appropriate for ${word.conjugation.person} subject
        - Keep sentences at ${word.level} level difficulty
        - Include English translations
        - Add brief notes about usage or grammar points
        
        Return a JSON array with this exact format:
        [
          {
            "spanish": "Spanish sentence using exactly '${word.word}'",
            "english": "English translation",
            "note": "Usage note",
            "conjugation": [
              {
                "verb": "${word.word}",
                "infinitive": "${word.conjugation.infinitive}",
                "tense": "${word.conjugation.tense}",
                "explanation": "How the verb is used in this context"
              }
            ]
          }
        ]
        
        Ensure the response is a valid JSON array with exactly ${word.generateOptions?.count || 3} examples.
        IMPORTANT: Each sentence MUST use the exact form "${word.word}" - no other conjugations allowed.`;
      } else {
        const tensePrompt = word.generateOptions?.tense === 'all'
          ? ''
          : `Use primarily ${word.generateOptions?.tense} tense.`;

        prompt = `Generate ${word.generateOptions?.count || 3} example sentences in Spanish using the word "${word.word}" (${word.type}) at ${word.level} level.
        Requirements:
        - Make sentences natural and contextually appropriate
        - Show different uses of the word
        - Keep sentences at ${word.level} level difficulty
        - ${tensePrompt}
        - Include English translations
        - Add brief notes about usage or grammar points
        
        Return a JSON array with this exact format:
        [
          {
            "spanish": "Spanish sentence",
            "english": "English translation",
            "note": "Usage note",
            "conjugation": [
              {
                "verb": "conjugated form",
                "infinitive": "base form",
                "tense": "tense name",
                "explanation": "why this form is used"
              }
            ]
          }
        ]
        
        Ensure the response is a valid JSON array with exactly ${word.generateOptions?.count || 3} examples.`;
      }

      const response = await generateText(prompt, {
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
      });

      const examples = JSON.parse(response);

      setWords(words.map(w =>
        w.word === word.word
          ? { 
              ...w, 
              examples, 
              isGenerating: false, 
              error: undefined,
              generateOptions: { 
                ...w.generateOptions!,
                showOptions: false 
              }
            }
          : w
      ));
    } catch (err) {
      console.error('Error generating examples:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to generate examples. Please try again.';
      
      setWords(words.map(w =>
        w.word === word.word
          ? {
              ...w,
              isGenerating: false,
              error: errorMessage,
              examples: undefined
            }
          : w
      ));
    }
  };

  const toggleTranslation = (word: string) => {
    setShowTranslations(prev => ({
      ...prev,
      [word]: !prev[word]
    }));
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };

  const sortWords = (words: WordWithExamples[]) => {
    switch (sortOption) {
      case 'date':
        return [...words].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      case 'alphabetical':
        return [...words].sort((a, b) => a.word.localeCompare(b.word));
      case 'source':
        return [...words].sort((a, b) => (a.source || '').localeCompare(b.source || ''));
      default:
        return words;
    }
  };

  const filterWords = (words: WordWithExamples[]) => {
    let filtered = words;

    if (activeTab === 'learned') {
      filtered = filtered.filter(word => word.isLearned);
    } else {
      filtered = filtered.filter(word => !word.isLearned);
      if (activeTab === 'conjugated') {
        filtered = filtered.filter(word => word.conjugation);
      } else {
        filtered = filtered.filter(word => !word.conjugation);
      }
    }

    if (selectedLevel) {
      filtered = filtered.filter(word => word.level === selectedLevel);
    }

    if (filterOption !== 'all') {
      if (['verbs', 'nouns', 'adjectives'].includes(filterOption)) {
        filtered = filtered.filter(word => word.type === filterOption.slice(0, -1));
      } else {
        filtered = filtered.filter(word => word.source === filterOption);
      }
    }

    return filtered;
  };

  const processedWords = sortWords(filterWords(words));
  const learnedCount = words.filter(w => w.isLearned).length;
  const totalCount = words.length;
  const progressPercentage = totalCount > 0 ? (learnedCount / totalCount) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
        Study Progress
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Progress Overview
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {learnedCount} of {totalCount} words learned
          </div>
        </div>
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'saved'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Book className="w-4 h-4 mr-2" />
          Saved Words & Infinitives
        </button>
        <button
          onClick={() => setActiveTab('conjugated')}
          className={`flex items-center px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'conjugated'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Conjugated Verbs
        </button>
        <button
          onClick={() => setActiveTab('learned')}
          className={`flex items-center px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'learned'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Learned Words
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <option value="date">Sort by Date</option>
          <option value="alphabetical">Sort Alphabetically</option>
          <option value="source">Sort by Source</option>
        </select>

        <select
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value as FilterOption)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <option value="all">All Sources</option>
          <option value="verbs">Verbs Only</option>
          <option value="nouns">Nouns Only</option>
          <option value="adjectives">Adjectives Only</option>
          <option value="topics">From Topics</option>
          <option value="generator">From Generator</option>
          <option value="analyzer">From Analyzer</option>
        </select>

        <div className="flex gap-2">
          {CEFR_LEVELS.map((level) => (
            <button
              key={level.name}
              onClick={() => setSelectedLevel(selectedLevel === level.name ? null : level.name)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedLevel === level.name
                  ? `bg-${level.color}-600 text-white`
                  : `bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                     hover:bg-${level.color}-100 dark:hover:bg-${level.color}-900/20`
              }`}
            >
              {level.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {processedWords.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {activeTab === 'learned' 
                ? "You haven't marked any words as learned yet"
                : activeTab === 'conjugated'
                ? "No conjugated verbs found"
                : "No saved words found"}
            </p>
          </motion.div>
        ) : (
          processedWords.map((word, index) => (
            <motion.div
              key={`${word.word}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {word.word}
                  </span>
                  {word.conjugation && (
                    <span className="text-gray-500 dark:text-gray-400">
                      → {word.conjugation.infinitive}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <SpanishAudioPlayer text={word.word} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!word.conjugation && (
                    <button
                      onClick={() => toggleGenerateOptions(word.word)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg"
                      title="Generate options"
                    >
                      <Settings2 className="w-5 h-5" />
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <select
                      value={word.generateOptions?.count || 3}
                      onChange={(e) => updateGenerateOptions(word.word, { count: parseInt(e.target.value) })}
                      className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                    >
                      <option value="1">1 Example</option>
                      <option value="3">3 Examples</option>
                      <option value="5">5 Examples</option>
                    </select>

                    <button
                      onClick={() => generateExamples(word)}
                      disabled={word.isGenerating}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        word.isGenerating
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {word.isGenerating ? (
                        <>
                          <RefreshCw className="inline-block w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Examples'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {!word.conjugation && word.generateOptions?.showOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tense
                      </label>
                      <select
                        value={word.generateOptions.tense}
                        onChange={(e) => updateGenerateOptions(word.word, { tense: e.target.value as TenseOption })}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                      >
                        <option value="all">All Tenses</option>
                        <option value="present">Present</option>
                        <option value="past">Past</option>
                        <option value="future">Future</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  word.type === 'verb'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : word.type === 'noun'
                    ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                    : 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                }`}>
                  {word.type}
                </span>

                <span className={`text-${CEFR_LEVELS.find(l => l.name === word.level)?.color}-600`}>
                  {word.level}
                </span>

                {word.conjugation && (
                  <>
                    <span className="text-gray-500 dark:text-gray-400">
                      {word.conjugation.tense}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {word.conjugation.person}
                    </span>
                  </>
                )}

                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(word.isLearned ? (word.learnedAt || 0) : (word.timestamp || 0))}
                </span>

                {word.source && (
                  <span className="text-gray-500 dark:text-gray-400">
                    From: {word.source}
                  </span>
                )}
              </div>

              <button
                onClick={() => word.isLearned ? markAsUnlearned(word.word) : markAsLearned(word.word)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  word.isLearned
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <CheckCircle className={`w-4 h-4 mr-2 ${
                  word.isLearned ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                }`} />
                {word.isLearned ? 'Learned' : 'Mark as Learned'}
              </button>

              {word.isLearned && activeTab === 'learned' && (
                <button
                  onClick={() => markAsUnlearned(word.word)}
                  className="mt-4 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Move back to study list
                </button>
              )}

              {word.examples && word.examples.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Example Sentences
                  </h3>
                  {word.examples.map((example, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-900 dark:text-white">
                          {example.spanish}
                        </p>
                        <SpanishAudioPlayer text={example.spanish} />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {example.english}
                      </p>
                      {example.note && (
                        <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2 italic">
                          Note: {example.note}
                        </p>
                      )}
                      {example.conjugation && example.conjugation.length > 0 && (
                        <div className="mt-2 text-sm">
                          {example.conjugation.map((conj, i) => (
                            <p key={i} className="text-gray-500 dark:text-gray-400">
                              {conj.verb} → {conj.infinitive} ({conj.tense})
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export { StudyPage };