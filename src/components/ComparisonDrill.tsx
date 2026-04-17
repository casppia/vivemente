import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, BookOpen, Dumbbell, CheckCircle, XCircle, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { generateText } from '../utils/openai';
import { SpanishAudioPlayer } from './SpanishAudioPlayer';
import { textToIPA } from '../utils/ipaTranscription';
import topicWords from '../data/words_by_topic.json';

function getRandomWords(count: number = 2): string[] {
  const allTopics = Object.values(topicWords).flat();
  const words: string[] = [];
  while (words.length < count) {
    const randomWord = allTopics[Math.floor(Math.random() * allTopics.length)];
    if (!words.includes(randomWord)) words.push(randomWord);
  }
  return words;
}

interface ComparisonPair {
  first: { spanish: string; english: string };
  second: { spanish: string; english: string };
  explanation?: string;
}

interface PracticeSentence {
  spanish: string;
  english: string;
  correctAnswer: string;
  explanation: string;
  options?: string[];
  formExplanation?: string;
}

interface ComparisonTopic {
  id: string;
  title: string;
  description: string;
  tag: string;
  color: string;
  examples: ComparisonPair[];
  practiceSentences: PracticeSentence[];
  isLoading: boolean;
  isPracticing: boolean;
  error: string | null;
  userAnswers: string[];
  showResults: boolean;
}

const TOPIC_META: Record<string, { tag: string; color: string }> = {
  pronouns:      { tag: 'Pronouns',    color: 'blue' },
  tenses:        { tag: 'Past Tenses', color: 'amber' },
  prepositions:  { tag: 'Prepositions',color: 'emerald' },
  imperfectVerbs:{ tag: 'Imperfect',   color: 'rose' },
  reflexiveVerbs:{ tag: 'Reflexives',  color: 'cyan' },
  serEstar:      { tag: 'Ser / Estar', color: 'violet' },
};

const colorMap: Record<string, { badge: string; light: string; border: string; button: string; text: string; accent: string }> = {
  blue:    { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', light: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800', button: 'bg-blue-600 hover:bg-blue-700', text: 'text-blue-700 dark:text-blue-300', accent: 'text-blue-500' },
  amber:   { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', light: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-800', button: 'bg-amber-600 hover:bg-amber-700', text: 'text-amber-700 dark:text-amber-300', accent: 'text-amber-500' },
  emerald: { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', light: 'bg-emerald-50 dark:bg-emerald-900/10', border: 'border-emerald-200 dark:border-emerald-800', button: 'bg-emerald-600 hover:bg-emerald-700', text: 'text-emerald-700 dark:text-emerald-300', accent: 'text-emerald-500' },
  rose:    { badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', light: 'bg-rose-50 dark:bg-rose-900/10', border: 'border-rose-200 dark:border-rose-800', button: 'bg-rose-600 hover:bg-rose-700', text: 'text-rose-700 dark:text-rose-300', accent: 'text-rose-500' },
  cyan:    { badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300', light: 'bg-cyan-50 dark:bg-cyan-900/10', border: 'border-cyan-200 dark:border-cyan-800', button: 'bg-cyan-600 hover:bg-cyan-700', text: 'text-cyan-700 dark:text-cyan-300', accent: 'text-cyan-500' },
  violet:  { badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300', light: 'bg-violet-50 dark:bg-violet-900/10', border: 'border-violet-200 dark:border-violet-800', button: 'bg-violet-600 hover:bg-violet-700', text: 'text-violet-700 dark:text-violet-300', accent: 'text-violet-500' },
};

const INITIAL_TOPICS: ComparisonTopic[] = [
  { id: 'pronouns',       title: 'Direct / Indirect Pronouns',     description: 'Compare sentences with and without pronouns',              ...TOPIC_META.pronouns,       examples: [], practiceSentences: [], isLoading: false, isPracticing: false, error: null, userAnswers: [], showResults: false },
  { id: 'tenses',         title: 'Preterite vs Imperfect',         description: 'Compare past tense usage in different contexts',            ...TOPIC_META.tenses,         examples: [], practiceSentences: [], isLoading: false, isPracticing: false, error: null, userAnswers: [], showResults: false },
  { id: 'prepositions',   title: 'Para vs Por',                    description: 'Compare the usage of para and por',                        ...TOPIC_META.prepositions,   examples: [], practiceSentences: [], isLoading: false, isPracticing: false, error: null, userAnswers: [], showResults: false },
  { id: 'imperfectVerbs', title: 'Había / Estaba / Era / Tenía',   description: 'Master distinctions between key imperfect tense verbs',    ...TOPIC_META.imperfectVerbs, examples: [], practiceSentences: [], isLoading: false, isPracticing: false, error: null, userAnswers: [], showResults: false },
  { id: 'reflexiveVerbs', title: 'Reflexive vs Non-Reflexive',     description: 'Practice distinguishing reflexive and non-reflexive forms', ...TOPIC_META.reflexiveVerbs, examples: [], practiceSentences: [], isLoading: false, isPracticing: false, error: null, userAnswers: [], showResults: false },
  { id: 'serEstar',       title: 'Ser vs Estar',                   description: 'Master when to use ser or estar',                          ...TOPIC_META.serEstar,       examples: [], practiceSentences: [], isLoading: false, isPracticing: false, error: null, userAnswers: [], showResults: false },
];

export function ComparisonDrill() {
  const [topics, setTopics] = useState<ComparisonTopic[]>(INITIAL_TOPICS);
  const [activeTopic, setActiveTopic] = useState<string>(INITIAL_TOPICS[0].id);

  const currentTopic = topics.find(t => t.id === activeTopic)!;
  const colors = colorMap[currentTopic.color];

  const generateExamples = async (topicId: string) => {
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, isLoading: true, error: null, isPracticing: false } : t));

    try {
      const contextWords = getRandomWords(2);
      const contextPrompt = `\n\nIMPORTANT: Include these words in your examples where appropriate: ${contextWords.join(', ')}.`;
      let prompt = '';

      switch (topicId) {
        case 'pronouns':
          prompt = `Generate 3 pairs of Spanish sentences demonstrating direct and indirect pronouns. For each pair, first sentence uses full noun, second replaces with pronoun. Include English translations and a brief explanation. Use natural Mexican Spanish vocabulary.${contextPrompt}\n\nReturn ONLY a JSON array:\n[{"first":{"spanish":"...","english":"..."},"second":{"spanish":"...","english":"..."},"explanation":"..."}]`;
          break;
        case 'tenses':
          prompt = `Generate 3 pairs of Spanish sentences comparing preterite and imperfect tenses. Same context but different aspects. Include English translations and brief explanation.${contextPrompt}\n\nReturn ONLY a JSON array:\n[{"first":{"spanish":"...","english":"..."},"second":{"spanish":"...","english":"..."},"explanation":"..."}]`;
          break;
        case 'prepositions':
          prompt = `Generate 3 pairs of Spanish sentences comparing para and por with clear contrast in meaning. Include English translations and brief explanation.${contextPrompt}\n\nReturn ONLY a JSON array:\n[{"first":{"spanish":"...","english":"..."},"second":{"spanish":"...","english":"..."},"explanation":"..."}]`;
          break;
        case 'imperfectVerbs':
          prompt = `Generate 3 pairs of Spanish sentences comparing había, estaba, era, and tenía. había=there was/were, estaba=location/temporary state, era=permanent/identity/time, tenía=possession/age.${contextPrompt}\n\nReturn ONLY a JSON array:\n[{"first":{"spanish":"...","english":"..."},"second":{"spanish":"...","english":"..."},"explanation":"..."}]`;
          break;
        case 'reflexiveVerbs':
          prompt = `Generate 3 pairs comparing reflexive and non-reflexive Spanish verbs (caer/caerse, poner/ponerse, llevar/llevarse, sentir/sentirse, echar/echarse, parecer/parecerse, quedar/quedarse). Use varied tenses.${contextPrompt}\n\nReturn ONLY a JSON array:\n[{"first":{"spanish":"...","english":"..."},"second":{"spanish":"...","english":"..."},"explanation":"..."}]`;
          break;
        case 'serEstar':
          prompt = `Generate 3 pairs of Spanish sentences comparing ser and estar with clear contrasts (permanent vs temporary, professions, adjectives that change meaning). Use varied tenses.${contextPrompt}\n\nReturn ONLY a JSON array:\n[{"first":{"spanish":"...","english":"..."},"second":{"spanish":"...","english":"..."},"explanation":"..."}]`;
          break;
      }

      const response = await generateText(prompt, { model: 'gpt-3.5-turbo', maxTokens: 1000, temperature: 0.7 });
      const examples = JSON.parse(response);
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, examples, isLoading: false } : t));
    } catch (err) {
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, isLoading: false, error: err instanceof Error ? err.message : 'Failed to generate examples' } : t));
    }
  };

  const generatePractice = async (topicId: string) => {
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, isLoading: true, error: null, practiceSentences: [], userAnswers: [], showResults: false, isPracticing: true } : t));

    try {
      const contextWords = getRandomWords(2);
      const contextPrompt = `\n\nIMPORTANT: Include these words where appropriate: ${contextWords.join(', ')}.`;
      let prompt = '';

      switch (topicId) {
        case 'pronouns':
          prompt = `Generate 5 Spanish sentences for pronoun practice. Replace the pronoun with _____. Include correct answer, English translation, and brief explanation.${contextPrompt}\n\nReturn ONLY a JSON array:\n[{"spanish":"..._____ ...","english":"...","correctAnswer":"...","explanation":"..."}]`;
          break;
        case 'tenses':
          prompt = `Generate 5 Spanish sentences for preterite vs imperfect practice. Replace verb with _____. Include correct conjugated form, options (2 choices), English translation, and brief explanation.${contextPrompt}\n\nReturn ONLY a JSON array:\n[{"spanish":"..._____ ...","english":"...","correctAnswer":"...","options":["...","..."],"explanation":"..."}]`;
          break;
        case 'prepositions':
          prompt = `Generate 5 Spanish sentences for por/para practice. Replace preposition with _____. Include options ["por","para"], English translation, and brief explanation.${contextPrompt}\n\nReturn ONLY a JSON array:\n[{"spanish":"..._____ ...","english":"...","correctAnswer":"...","options":["por","para"],"explanation":"..."}]`;
          break;
        case 'imperfectVerbs':
          prompt = `Generate 5 Spanish sentences for había/estaba/era/tenía practice. Replace verb with _____. Include options ["había","estaba","era","tenía"], English translation, and brief explanation.${contextPrompt}\n\nReturn ONLY a JSON array:\n[{"spanish":"..._____ ...","english":"...","correctAnswer":"...","options":["había","estaba","era","tenía"],"explanation":"..."}]`;
          break;
        case 'reflexiveVerbs':
          prompt = `Generate 5 Spanish fill-in-the-blank sentences to practice reflexive vs non-reflexive verbs. Use these verb pairs: lavar/lavarse, poner/ponerse, llevar/llevarse, sentir/sentirse, echar/echarse, parecer/parecerse, quedar/quedarse. Replace the verb with _____. For each sentence provide 4 options which must be ACTUAL conjugated Spanish verb forms (e.g. "lava", "se lava", "lavaba", "se lavaba") — never use English labels or descriptions. The correctAnswer must exactly match one of the 4 options. Also include a "formExplanation" field (1-2 sentences) that explains the grammar rule behind why the correct form (reflexive or non-reflexive) is used in this specific sentence.${contextPrompt}\n\nReturn ONLY a JSON array:\n[{"spanish":"_____ los dientes cada noche.","english":"...","correctAnswer":"Me lavo","options":["Me lavo","Lavo","Me lavé","Lavé"],"explanation":"...","formExplanation":"'Lavarse' is used here because the subject is performing the action on themselves (brushing their own teeth). The reflexive pronoun 'me' signals this self-directed action."}]`;
          break;
        case 'serEstar':
          prompt = `Generate 5 Spanish sentences for ser vs estar practice. Replace verb with _____. Include 4 options (es/está/era/estaba or similar conjugations), English translation, and brief explanation.${contextPrompt}\n\nReturn ONLY a JSON array:\n[{"spanish":"..._____ ...","english":"...","correctAnswer":"...","options":["...","...","...","..."],"explanation":"..."}]`;
          break;
      }

      const response = await generateText(prompt, { model: 'gpt-3.5-turbo', maxTokens: 1000, temperature: 0.7 });
      const practiceSentences = JSON.parse(response);
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, practiceSentences, userAnswers: new Array(practiceSentences.length).fill(''), isLoading: false } : t));
    } catch (err) {
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, isLoading: false, error: err instanceof Error ? err.message : 'Failed to generate practice sentences' } : t));
    }
  };

  const handleAnswerChange = (topicId: string, index: number, value: string) => {
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, userAnswers: t.userAnswers.map((a, i) => i === index ? value : a) } : t));
  };

  const handleSubmit = (topicId: string) => {
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, showResults: true } : t));
  };

  const getScore = (topic: ComparisonTopic) => {
    return topic.practiceSentences.filter((s, i) =>
      topic.userAnswers[i]?.toLowerCase() === s.correctAnswer.toLowerCase()
    ).length;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Comparison Drills
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Study tricky Spanish grammar pairs side-by-side, then test yourself with interactive exercises.
        </p>
      </div>

      {/* Topic selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {topics.map(topic => {
          const c = colorMap[topic.color];
          const isActive = activeTopic === topic.id;
          return (
            <button
              key={topic.id}
              onClick={() => setActiveTopic(topic.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                isActive
                  ? `${c.light} ${c.border} shadow-sm`
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${c.badge}`}>
                {topic.tag}
              </span>
              <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {topic.title}
              </p>
              {isActive && (
                <ChevronRight className={`w-4 h-4 mt-1 ${c.accent}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Active topic panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTopic}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Panel header */}
          <div className={`px-6 py-5 border-b border-gray-100 dark:border-gray-700 ${colors.light}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${colors.badge}`}>
                  {currentTopic.tag}
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentTopic.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {currentTopic.description}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => generateExamples(currentTopic.id)}
                  disabled={currentTopic.isLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${
                    currentTopic.isLoading ? 'opacity-50 cursor-not-allowed bg-gray-400' : `${colors.button}`
                  }`}
                >
                  {currentTopic.isLoading && !currentTopic.isPracticing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <BookOpen className="w-4 h-4" />
                  )}
                  Examples
                </button>
                <button
                  onClick={() => generatePractice(currentTopic.id)}
                  disabled={currentTopic.isLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    currentTopic.isLoading
                      ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 text-gray-400'
                      : `${colors.border} ${colors.text} bg-white dark:bg-gray-800 hover:${colors.light}`
                  }`}
                >
                  {currentTopic.isLoading && currentTopic.isPracticing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Dumbbell className="w-4 h-4" />
                  )}
                  Practice
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {currentTopic.error && (
            <div className="mx-6 mt-5 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{currentTopic.error}</p>
            </div>
          )}

          {/* Loading state */}
          {currentTopic.isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className={`w-10 h-10 rounded-full border-4 border-gray-200 dark:border-gray-700 animate-spin ${colors.border}`}
                   style={{ borderTopColor: 'currentColor' }}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentTopic.isPracticing ? 'Generating practice sentences...' : 'Generating examples...'}
              </p>
            </div>
          )}

          {/* Empty state */}
          {!currentTopic.isLoading && !currentTopic.error && currentTopic.examples.length === 0 && currentTopic.practiceSentences.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-8">
              <Sparkles className={`w-10 h-10 mb-3 ${colors.accent}`} />
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Ready to learn</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click <strong>Examples</strong> to see side-by-side comparisons, or jump straight into <strong>Practice</strong>.
              </p>
            </div>
          )}

          {/* Examples view */}
          {!currentTopic.isLoading && !currentTopic.isPracticing && currentTopic.examples.length > 0 && (
            <div className="p-6 space-y-5">
              {currentTopic.examples.map((pair, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`rounded-xl border ${colors.border} overflow-hidden`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700">
                    {/* First sentence */}
                    <div className="p-5 space-y-3">
                      <div className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                        A
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                            {pair.first.spanish}
                          </p>
                          <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-1 break-all">
                            {textToIPA(pair.first.spanish)}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <SpanishAudioPlayer text={pair.first.spanish} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        {pair.first.english}
                      </p>
                    </div>

                    {/* Second sentence */}
                    <div className={`p-5 space-y-3 ${colors.light}`}>
                      <div className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                        B
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                            {pair.second.spanish}
                          </p>
                          <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-1 break-all">
                            {textToIPA(pair.second.spanish)}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <SpanishAudioPlayer text={pair.second.spanish} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        {pair.second.english}
                      </p>
                    </div>
                  </div>

                  {pair.explanation && (
                    <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700">
                      <p className={`text-sm font-medium ${colors.text}`}>
                        {pair.explanation}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Practice view */}
          {!currentTopic.isLoading && currentTopic.isPracticing && currentTopic.practiceSentences.length > 0 && (
            <div className="p-6 space-y-4">
              {/* Score banner */}
              {currentTopic.showResults && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-xl flex items-center justify-between ${
                    getScore(currentTopic) === currentTopic.practiceSentences.length
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <div>
                    <p className={`font-semibold ${getScore(currentTopic) === currentTopic.practiceSentences.length ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                      {getScore(currentTopic) === currentTopic.practiceSentences.length ? '¡Perfecto!' : 'Keep practising!'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getScore(currentTopic)} / {currentTopic.practiceSentences.length} correct
                    </p>
                  </div>
                  <button
                    onClick={() => generatePractice(currentTopic.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${colors.button}`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                </motion.div>
              )}

              {currentTopic.practiceSentences.map((sentence, index) => {
                const answered = currentTopic.showResults;
                const isCorrect = answered && currentTopic.userAnswers[index]?.toLowerCase() === sentence.correctAnswer.toLowerCase();
                const isWrong = answered && !isCorrect;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className={`rounded-xl border p-5 transition-all ${
                      answered
                        ? isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                          : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${colors.badge}`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <p className="text-gray-900 dark:text-white flex-1 leading-relaxed">
                            {sentence.options ? (
                              <>
                                {sentence.spanish.split('_____')[0]}
                                <select
                                  value={currentTopic.userAnswers[index]}
                                  onChange={e => handleAnswerChange(currentTopic.id, index, e.target.value)}
                                  disabled={answered}
                                  className={`mx-1.5 px-2.5 py-1 rounded-lg border text-sm font-medium transition-all appearance-none cursor-pointer ${
                                    answered
                                      ? isCorrect
                                        ? 'border-emerald-400 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                        : 'border-red-400 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                      : `${colors.border} bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`
                                  }`}
                                >
                                  <option value="">Choose...</option>
                                  {sentence.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                                {sentence.spanish.split('_____')[1]}
                              </>
                            ) : (
                              <>
                                {sentence.spanish.split('_____')[0]}
                                <input
                                  type="text"
                                  value={currentTopic.userAnswers[index]}
                                  onChange={e => handleAnswerChange(currentTopic.id, index, e.target.value)}
                                  disabled={answered}
                                  placeholder="..."
                                  className={`inline-block w-24 mx-1.5 px-2 py-1 rounded-lg border text-sm font-medium transition-all text-center ${
                                    answered
                                      ? isCorrect
                                        ? 'border-emerald-400 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                        : 'border-red-400 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                      : `${colors.border} bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`
                                  }`}
                                />
                                {sentence.spanish.split('_____')[1]}
                              </>
                            )}
                          </p>
                          <div className="shrink-0">
                            <SpanishAudioPlayer text={sentence.spanish.replace('_____', currentTopic.userAnswers[index] || '...')} />
                          </div>
                        </div>
                        <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-1">
                          {textToIPA(sentence.spanish.replace('_____', currentTopic.userAnswers[index] || '...'))}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 italic ml-9 mb-3">
                      {sentence.english}
                    </p>

                    {answered && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="ml-9 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Correct!</p>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                                Correct answer: <span className="font-bold">{sentence.correctAnswer}</span>
                              </p>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {sentence.explanation}
                        </p>
                        {currentTopic.id === 'reflexiveVerbs' && sentence.formExplanation && (
                          <div className="mt-1 px-3 py-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
                            <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 mb-0.5 uppercase tracking-wide">
                              Why this form?
                            </p>
                            <p className="text-sm text-cyan-800 dark:text-cyan-300">
                              {sentence.formExplanation}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {!currentTopic.showResults && (
                <button
                  onClick={() => handleSubmit(currentTopic.id)}
                  disabled={currentTopic.userAnswers.some(a => !a)}
                  className={`w-full mt-2 py-3 rounded-xl text-sm font-semibold text-white transition-all ${
                    currentTopic.userAnswers.some(a => !a)
                      ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500'
                      : `${colors.button} shadow-sm hover:shadow`
                  }`}
                >
                  Check Answers
                </button>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
