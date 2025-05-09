import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { generateText } from '../utils/openai';
import { SpanishAudioPlayer } from './SpanishAudioPlayer';
import topicWords from '../data/words_by_topic.json';

// Helper function to get random words from topics
function getRandomWords(count: number = 2): string[] {
  const allTopics = Object.values(topicWords).flat();
  const words: string[] = [];
  
  while (words.length < count) {
    const randomWord = allTopics[Math.floor(Math.random() * allTopics.length)];
    if (!words.includes(randomWord)) {
      words.push(randomWord);
    }
  }
  
  return words;
}

interface ComparisonPair {
  first: {
    spanish: string;
    english: string;
  };
  second: {
    spanish: string;
    english: string;
  };
  explanation?: string;
}

interface PracticeSentence {
  spanish: string;
  english: string;
  correctAnswer: string;
  explanation: string;
  options?: string[];
}

interface ComparisonTopic {
  id: string;
  title: string;
  description: string;
  examples: ComparisonPair[];
  practiceSentences: PracticeSentence[];
  isLoading: boolean;
  isPracticing: boolean;
  error: string | null;
  userAnswers: string[];
  showResults: boolean;
}

export function ComparisonDrill() {
  const [topics, setTopics] = useState<ComparisonTopic[]>([
    {
      id: 'pronouns',
      title: 'Direct/Indirect Pronouns',
      description: 'Compare sentences with and without pronouns',
      examples: [],
      practiceSentences: [],
      isLoading: false,
      isPracticing: false,
      error: null,
      userAnswers: [],
      showResults: false,
    },
    {
      id: 'tenses',
      title: 'Preterite vs Imperfect',
      description: 'Compare past tense usage in different contexts',
      examples: [],
      practiceSentences: [],
      isLoading: false,
      isPracticing: false,
      error: null,
      userAnswers: [],
      showResults: false,
    },
    {
      id: 'prepositions',
      title: 'Para vs Por',
      description: 'Compare the usage of para and por',
      examples: [],
      practiceSentences: [],
      isLoading: false,
      isPracticing: false,
      error: null,
      userAnswers: [],
      showResults: false,
    },
  ]);

  const generateExamples = async (topicId: string) => {
    setTopics(prev => prev.map(topic => 
      topic.id === topicId ? { ...topic, isLoading: true, error: null } : topic
    ));

    try {
      // Get random words to include in examples
      const contextWords = getRandomWords(2);
      const contextPrompt = `\n\nIMPORTANT: Include these words in your examples where appropriate: ${contextWords.join(', ')}. Create natural sentences using these words to show different contexts.`;

      let prompt = '';
      switch (topicId) {
        case 'pronouns':
          prompt = `Generate 3 pairs of Spanish sentences demonstrating direct and indirect pronouns.
          For each pair:
          - First sentence should use the full noun/name
          - Second sentence should replace it with the appropriate pronoun
          - Include English translations
          - Add a brief explanation of the pronoun usage
          - Use natural, everyday Mexican Spanish vocabulary
          ${contextPrompt}

          Return the response as a JSON array with this format:
          [
            {
              "first": {
                "spanish": "Spanish sentence without pronouns",
                "english": "English translation"
              },
              "second": {
                "spanish": "Spanish sentence with pronouns",
                "english": "English translation"
              },
              "explanation": "Brief explanation of the pronoun usage"
            }
          ]

          Return ONLY the JSON array, no other text.`;
          break;

        case 'tenses':
          prompt = `Generate 3 pairs of Spanish sentences comparing preterite and imperfect tenses.
          For each pair:
          - First sentence should use preterite
          - Second sentence should use imperfect
          - Use the same context but show different aspects
          - Include English translations
          - Add a brief explanation of why each tense is used
          - Use natural, everyday Mexican Spanish vocabulary
          ${contextPrompt}

          Return the response as a JSON array with this format:
          [
            {
              "first": {
                "spanish": "Preterite sentence",
                "english": "English translation"
              },
              "second": {
                "spanish": "Imperfect sentence",
                "english": "English translation"
              },
              "explanation": "Brief explanation of the tense usage"
            }
          ]

          Return ONLY the JSON array, no other text.`;
          break;

        case 'prepositions':
          prompt = `Generate 3 pairs of Spanish sentences comparing para and por.
          For each pair:
          - First sentence should use para
          - Second sentence should use por
          - Show clear contrast in meaning
          - Include English translations
          - Add a brief explanation of why each preposition is used
          - Use natural, everyday Mexican Spanish vocabulary
          ${contextPrompt}

          Return the response as a JSON array with this format:
          [
            {
              "first": {
                "spanish": "Sentence with para",
                "english": "English translation"
              },
              "second": {
                "spanish": "Sentence with por",
                "english": "English translation"
              },
              "explanation": "Brief explanation of the preposition usage"
            }
          ]

          Return ONLY the JSON array, no other text.`;
          break;
      }

      const response = await generateText(prompt, {
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
      });

      const examples = JSON.parse(response);

      setTopics(prev => prev.map(topic => 
        topic.id === topicId ? { ...topic, examples, isLoading: false, error: null } : topic
      ));
    } catch (err) {
      console.error('Error generating examples:', err);
      setTopics(prev => prev.map(topic => 
        topic.id === topicId ? {
          ...topic,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to generate examples'
        } : topic
      ));
    }
  };

  const generatePractice = async (topicId: string) => {
    setTopics(prev => prev.map(topic => 
      topic.id === topicId ? {
        ...topic,
        isLoading: true,
        error: null,
        practiceSentences: [],
        userAnswers: [],
        showResults: false,
        isPracticing: true
      } : topic
    ));

    try {
      // Get random words to include in practice sentences
      const contextWords = getRandomWords(2);
      const contextPrompt = `\n\nIMPORTANT: Include these words in your practice sentences where appropriate: ${contextWords.join(', ')}. Create natural sentences using these words to test understanding.`;

      let prompt = '';
      switch (topicId) {
        case 'pronouns':
          prompt = `Generate 5 Spanish sentences for pronoun practice.
          For each sentence:
          - Create a sentence that requires a pronoun
          - Replace the pronoun with _____
          - Include the correct pronoun as the answer
          - Provide clear context clues
          - Include English translations
          - Add brief explanations
          ${contextPrompt}

          Return the response as a JSON array with this format:
          [
            {
              "spanish": "María dio el libro a Juan. _____ dio el libro.",
              "english": "María gave the book to Juan. She gave him the book.",
              "correctAnswer": "le",
              "explanation": "Use 'le' as indirect object pronoun for 'to Juan'"
            }
          ]

          Return ONLY the JSON array, no other text.`;
          break;

        case 'tenses':
          prompt = `Generate 5 Spanish sentences for past tense practice.
          For each sentence:
          - Create a sentence that clearly requires either preterite or imperfect
          - Replace the verb with _____
          - Provide the correct form as the answer
          - Include English translations
          - Add brief explanations
          ${contextPrompt}

          Return the response as a JSON array with this format:
          [
            {
              "spanish": "Mientras _____ por el parque, vi a Juan.",
              "english": "While I was walking in the park, I saw Juan.",
              "correctAnswer": "caminaba",
              "options": ["caminaba", "caminó"],
              "explanation": "Use imperfect for ongoing action interrupted by preterite"
            }
          ]

          Return ONLY the JSON array, no other text.`;
          break;

        case 'prepositions':
          prompt = `Generate 5 Spanish sentences for por/para practice.
          For each sentence:
          - Create a sentence that clearly requires either por or para
          - Replace the preposition with _____
          - Provide the correct preposition as the answer
          - Include English translations
          - Add brief explanations
          ${contextPrompt}

          Return the response as a JSON array with this format:
          [
            {
              "spanish": "Este regalo es _____ ti.",
              "english": "This gift is for you.",
              "correctAnswer": "para",
              "options": ["por", "para"],
              "explanation": "Use 'para' to indicate the recipient of something"
            }
          ]

          Return ONLY the JSON array, no other text.`;
          break;
      }

      const response = await generateText(prompt, {
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
      });

      const practiceSentences = JSON.parse(response);

      setTopics(prev => prev.map(topic => 
        topic.id === topicId ? {
          ...topic,
          practiceSentences,
          userAnswers: new Array(practiceSentences.length).fill(''),
          isLoading: false,
          error: null
        } : topic
      ));
    } catch (err) {
      setTopics(prev => prev.map(topic => 
        topic.id === topicId ? {
          ...topic,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to generate practice sentences'
        } : topic
      ));
    }
  };

  const handleAnswerChange = (topicId: string, index: number, value: string) => {
    setTopics(prev => prev.map(topic =>
      topic.id === topicId ? {
        ...topic,
        userAnswers: topic.userAnswers.map((ans, i) => i === index ? value : ans)
      } : topic
    ));
  };

  const handleSubmit = (topicId: string) => {
    setTopics(prev => prev.map(topic =>
      topic.id === topicId ? { ...topic, showResults: true } : topic
    ));
  };

  const handleTryAgain = (topicId: string) => {
    generatePractice(topicId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Comparison Drills
      </h1>

      <div className="space-y-8">
        {topics.map((topic) => (
          <div key={topic.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {topic.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {topic.description}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => generateExamples(topic.id)}
                  disabled={topic.isLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    topic.isLoading
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {topic.isLoading ? (
                    <>
                      <RefreshCw className="inline-block w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Examples'
                  )}
                </button>

                <button
                  onClick={() => generatePractice(topic.id)}
                  disabled={topic.isLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    topic.isLoading
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Practice
                </button>
              </div>
            </div>

            {topic.error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{topic.error}</p>
              </div>
            )}

            {!topic.isPracticing && topic.examples.length > 0 && (
              <div className="space-y-6">
                {topic.examples.map((pair, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-900 dark:text-white font-medium">
                            {pair.first.spanish}
                          </p>
                          <SpanishAudioPlayer text={pair.first.spanish} />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {pair.first.english}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-900 dark:text-white font-medium">
                            {pair.second.spanish}
                          </p>
                          <SpanishAudioPlayer text={pair.second.spanish} />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {pair.second.english}
                        </p>
                      </div>
                    </div>

                    {pair.explanation && (
                      <p className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 italic">
                        {pair.explanation}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {topic.isPracticing && topic.practiceSentences.length > 0 && (
              <div className="space-y-6">
                {topic.practiceSentences.map((sentence, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <p className="text-gray-900 dark:text-white">
                          {sentence.spanish.split('_____')[0]}
                          {sentence.options ? (
                            <select
                              value={topic.userAnswers[index]}
                              onChange={(e) => handleAnswerChange(topic.id, index, e.target.value)}
                              disabled={topic.showResults}
                              className={`mx-1 px-2 py-1 rounded border ${
                                topic.showResults
                                  ? topic.userAnswers[index].toLowerCase() === sentence.correctAnswer.toLowerCase()
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                              }`}
                            >
                              <option value="">Select...</option>
                              {sentence.options.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={topic.userAnswers[index]}
                              onChange={(e) => handleAnswerChange(topic.id, index, e.target.value)}
                              disabled={topic.showResults}
                              className={`w-24 px-2 py-1 mx-1 rounded border ${
                                topic.showResults
                                  ? topic.userAnswers[index].toLowerCase() === sentence.correctAnswer.toLowerCase()
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                              }`}
                            />
                          )}
                          {sentence.spanish.split('_____')[1]}
                        </p>
                        <SpanishAudioPlayer text={sentence.spanish} />
                      </div>

                      <p className="text-gray-600 dark:text-gray-400">
                        {sentence.english}
                      </p>

                      {topic.showResults && (
                        <div className="mt-2">
                          {topic.userAnswers[index].toLowerCase() === sentence.correctAnswer.toLowerCase() ? (
                            <p className="text-green-600 dark:text-green-400 text-sm">
                              ¡Correcto! ✓
                            </p>
                          ) : (
                            <p className="text-red-600 dark:text-red-400 text-sm">
                              The correct answer is: <strong>{sentence.correctAnswer}</strong>
                            </p>
                          )}
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            {sentence.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {!topic.showResults ? (
                  <button
                    onClick={() => handleSubmit(topic.id)}
                    className="w-full mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Check Answers
                  </button>
                ) : (
                  <button
                    onClick={() => handleTryAgain(topic.id)}
                    className="w-full mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Try New Sentences
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}