import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { VerbTense, PracticeSentence } from '../types/practice';
import { generateText } from '../utils/openai';
import { useWordStore } from '../store/useWordStore';

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
  const [showDetails, setShowDetails] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState<{ index: number; verb: string; subject: string } | null>(null);
  const { addWord } = useWordStore();

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

      Return the response as a JSON array with this format:
      {
        "spanish": "¿_____ (ir) tú al mercado mañana?",
        "english": "Are you going to the market tomorrow?",
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

      const practiceData = JSON.parse(response) as PracticeSentence[];
      setSentences(practiceData);
      setUserAnswers(new Array(practiceData.length).fill(''));
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
  };

  const handleTryAgain = () => {
    generatePractice();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {tense.name}
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2"
            >
              {showDetails ? 'Hide details' : 'Show details'}
              {showDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={generatePractice}
              disabled={loading}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                loading
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="inline-block w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Practice'
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              When to use:
            </h4>
            <ul className="space-y-2">
              {tense.description.split('. ').map((desc, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-400 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Formation:
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {tense.formation}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Example with "{tense.example.infinitive}":
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(tense.example.conjugation).map(([person, form]) => (
                        <div key={person} className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400 font-medium w-20">
                            {person}:
                          </span>
                          <span className="text-indigo-600 dark:text-indigo-400">
                            {form}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time Markers:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {tense.timeMarkers.map((marker, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                        >
                          {marker}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {sentences.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {sentences.map((sentence, index) => (
                  <div key={index} className="space-y-2">
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
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {sentence.english}
                    </p>
                    {showResults && (
                      <div className="mt-1">
                        {userAnswers[index].toLowerCase() === sentence.verb.correctForm.toLowerCase() ? (
                          <p className="text-green-600 dark:text-green-400 text-sm">
                            ¡Correcto! ✓
                          </p>
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

                {!showResults ? (
                  <button
                    onClick={handleSubmit}
                    className="w-full mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Check Answers
                  </button>
                ) : (
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

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}