import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Clock, Volume2, Loader2 } from 'lucide-react';
import { VerbTense, PracticeSentence } from '../types/practice';
import { generateText } from '../utils/openai';
import { useWordStore } from '../store/useWordStore';
import { usePracticeStore } from '../store/usePracticeStore';
import { getTensePrompt } from '../utils/tensePrompts';
import { TenseTooltip } from './TenseTooltip';
import { generateSpeech, isElevenLabsAvailable, getDefaultSpanishVoices } from '../utils/elevenLabs';

interface Props {
  level: string;
  tense: VerbTense;
}

export function ConjugationPractice({ level, tense }: Props) {
  const [sentences, setSentences] = useState<PracticeSentence[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState<{ index: number; verb: string; subject: string } | null>(null);
  const [audioLoading, setAudioLoading] = useState<{ [key: number]: boolean }>({});
  const [audioUrls, setAudioUrls] = useState<{ [key: number]: string }>({});
  const { addWord, savedWords } = useWordStore();
  const { incrementPracticeCount, getPracticeStats } = usePracticeStore();
  const stats = getPracticeStats(tense.name);
  const hasElevenLabs = isElevenLabsAvailable();

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  const generatePractice = async () => {
    setLoading(true);
    setError(null);
    setSentences([]);
    setUserAnswers([]);
    setShowResults(false);
    setShowSaveDialog(null);
    setAudioUrls({});
    setAudioLoading({});

    try {
      const prompt = getTensePrompt(tense.name, level);

      const response = await generateText(prompt, {
        model: 'gpt-4',
        maxTokens: 1500,
        temperature: 0.7,
      });

      const practiceData = JSON.parse(response) as PracticeSentence[];

      const validatedData = practiceData.map((sentence, index) => {
        if (!sentence.verb.subject) {
          console.error('Missing subject in verb data:', sentence);
          throw new Error('Invalid API response: missing verb subject');
        }

        if (!sentence.verb.tense || !sentence.verb.tense.toLowerCase().includes(tense.name.toLowerCase().split(' ')[0])) {
          console.warn(`Sentence ${index + 1} may not use ${tense.name}:`, sentence);
        }

        return sentence;
      });

      if (validatedData.length !== 5) {
        throw new Error(`Expected 5 sentences, but received ${validatedData.length}`);
      }

      setSentences(validatedData);
      setUserAnswers(new Array(validatedData.length).fill(''));
    } catch (err) {
      console.error('Error generating practice sentences:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate practice sentences');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setShowResults(true);
    incrementPracticeCount(tense.name);
  };

  const handleTryAgain = () => {
    generatePractice();
  };

  const handleSaveVerb = (index: number) => {
    const sentence = sentences[index];
    if (!sentence.verb.subject) {
      console.error('Missing subject for verb:', sentence);
      setError('Cannot save verb: missing subject information');
      return;
    }
    
    setShowSaveDialog({
      index,
      verb: sentence.verb.correctForm,
      subject: sentence.verb.subject
    });
  };

  const confirmSaveVerb = () => {
    if (!showSaveDialog) return;

    const sentence = sentences[showSaveDialog.index];

    if (!sentence.verb.subject) {
      console.error('Missing subject during save:', sentence);
      setError('Cannot save verb: missing subject information');
      return;
    }

    addWord({
      word: sentence.verb.correctForm,
      type: 'verb',
      level: level as any,
      conjugation: {
        infinitive: sentence.verb.infinitive,
        conjugatedForm: sentence.verb.correctForm,
        tense: sentence.verb.tense,
        person: sentence.verb.subject
      },
    });

    setShowSaveDialog(null);
  };

  const playAudio = async (index: number) => {
    if (audioUrls[index]) {
      const audio = new Audio(audioUrls[index]);
      audio.play();
      return;
    }

    setAudioLoading({ ...audioLoading, [index]: true });

    try {
      const sentence = sentences[index];
      const fullSentence = sentence.spanish.replace('_____', sentence.verb.correctForm);
      const voices = getDefaultSpanishVoices();
      const blob = await generateSpeech(fullSentence, voices[0].voice_id);

      if (blob) {
        const url = URL.createObjectURL(blob);
        setAudioUrls({ ...audioUrls, [index]: url });
        const audio = new Audio(url);
        audio.play();
      }
    } catch (err) {
      console.error('Error playing audio:', err);
    } finally {
      setAudioLoading({ ...audioLoading, [index]: false });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <TenseTooltip tenseName={tense.name} description={tense.description} />
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Practiced:</span>
              <span className="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md">
                {stats.practiceCount} times
              </span>
            </div>
            {stats.lastPracticed && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Last: {formatDate(stats.lastPracticed)}</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={generatePractice}
          disabled={loading}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-all transform hover:scale-105 active:scale-95 ${
            loading
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            'Start Practice'
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {sentences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {sentences.map((sentence, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 dark:text-white flex-1">
                        {sentence.spanish.split('_____')[0]}
                        <input
                          type="text"
                          value={userAnswers[index]}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          disabled={showResults}
                          className={`w-32 px-2 py-1 mx-1 rounded border ${
                            showResults
                              ? userAnswers[index].toLowerCase() === sentence.verb.correctForm.toLowerCase()
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                          }`}
                          placeholder={`(${sentence.verb.infinitive})`}
                        />
                        {sentence.spanish.split('_____')[1]}
                      </p>
                      {hasElevenLabs && showResults && (
                        <button
                          onClick={() => playAudio(index)}
                          disabled={audioLoading[index]}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Listen to pronunciation"
                        >
                          {audioLoading[index] ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {sentence.english}
                    </p>
                  </div>
                  {showResults && (
                    <button
                      onClick={() => handleSaveVerb(index)}
                      className="px-3 py-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                    >
                      Save Verb
                    </button>
                  )}
                </div>
                {showResults && (
                  <div className="mt-1">
                    {userAnswers[index].toLowerCase() === sentence.verb.correctForm.toLowerCase() ? (
                      <div>
                        <p className="text-green-600 dark:text-green-400 text-sm">
                          ¡Correcto! ✓
                        </p>
                        <p className="text-indigo-600 dark:text-indigo-400 text-sm mt-1 font-mono">
                          IPA: {sentence.ipa}
                        </p>
                      </div>
                    ) : (
                      <p className="text-red-600 dark:text-red-400 text-sm">
                        The correct form is: <strong>{sentence.verb.correctForm}</strong> ({sentence.verb.subject})
                      </p>
                    )}
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      {sentence.context}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {!showResults && (
              <button
                onClick={handleSubmit}
                className="w-full mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Check Answers
              </button>
            )}

            {showResults && (
              <button
                onClick={handleTryAgain}
                className="w-full mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Try New Sentences
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <p className="text-gray-900 dark:text-white mb-4">
              Would you like to save the conjugated form "{showSaveDialog.verb} ({showSaveDialog.subject})" to your vocabulary list?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowSaveDialog(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmSaveVerb}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}