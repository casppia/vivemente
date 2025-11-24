import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Clock } from 'lucide-react';
import { VerbTense, PracticeSentence } from '../types/practice';
import { generateText } from '../utils/openai';
import { useWordStore } from '../store/useWordStore';
import { usePracticeStore } from '../store/usePracticeStore';

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
  const { addWord, savedWords } = useWordStore();
  const { incrementPracticeCount, getPracticeStats } = usePracticeStore();
  const stats = getPracticeStats(tense.name);

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

    try {
      const prompt = `Generate 5 Spanish sentences for conjugation practice at ${level} level using the ${tense.name} tense.
      For each sentence:
      - Leave a blank space where the conjugated verb should go
      - Include the infinitive form in parentheses
      - Provide clear context clues
      - Use different subjects (yo, tú, él/ella, nosotros, ellos)
      - Mix statements, questions, and negatives
      - Keep vocabulary appropriate for ${level} level
      - Include the proper IPA (International Phonetic Alphabet) transcription for the complete sentence (with the blank filled in with the correct verb form)
      - Use standard IPA symbols in brackets [like this] for Spanish pronunciation

      IMPORTANT: For IPA transcription, use proper IPA symbols:
      - Use [b] [d] [g] for stops, [β] [ð] [ɣ] for fricatives
      - Use [ɾ] for tap r, [r] for trill rr
      - Use [ʎ] for ll, [ɲ] for ñ
      - Use [x] for j/g (before e,i)
      - Use [θ] for c/z (in Castilian) or [s] (in Latin American)
      - Mark stress with ˈ before stressed syllable
      - Enclose entire transcription in square brackets [...]

      Return the response as a JSON array with this format:
      {
        "spanish": "¿_____ (ir) tú al mercado mañana?",
        "english": "Are you going to the market tomorrow?",
        "ipa": "[ˈbas tu al meɾˈkaðo maˈɲana]",
        "verb": {
          "infinitive": "ir",
          "correctForm": "vas",
          "subject": "tú",
          "tense": "Present Simple"
        },
        "context": "Asking about future plans using present tense"
      }

      Return ONLY a JSON array of 5 practice sentences, no other text.`;

      const response = await generateText(prompt, {
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
      });

      // Parse and validate the response
      const practiceData = JSON.parse(response) as PracticeSentence[];
      
      // Validate that each sentence has the required verb subject
      const validatedData = practiceData.map(sentence => {
        if (!sentence.verb.subject) {
          console.error('Missing subject in verb data:', sentence);
          throw new Error('Invalid API response: missing verb subject');
        }
        return sentence;
      });

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
    
    // Validate subject presence before saving
    if (!sentence.verb.subject) {
      console.error('Missing subject during save:', sentence);
      setError('Cannot save verb: missing subject information');
      return;
    }

    // Save the verb with its subject
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {tense.name}
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Practiced:</span>
              <span className="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">
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
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            loading
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-500'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {loading ? 'Generating...' : 'Practice'}
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
                    <p className="text-gray-900 dark:text-white">
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