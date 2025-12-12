import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { generateText } from '../utils/openai';
import { SpanishAudioPlayer } from './SpanishAudioPlayer';
import { textToIPA } from '../utils/ipaTranscription';
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
    {
      id: 'imperfectVerbs',
      title: 'Había / Estaba / Era / Tenía',
      description: 'Master the distinctions between key imperfect tense verbs',
      examples: [],
      practiceSentences: [],
      isLoading: false,
      isPracticing: false,
      error: null,
      userAnswers: [],
      showResults: false,
    },
    {
      id: 'reflexiveVerbs',
      title: 'Reflexive vs Non-Reflexive Verbs',
      description: 'Practice distinguishing between reflexive and non-reflexive forms',
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

        case 'imperfectVerbs':
          prompt = `Generate 3 pairs of Spanish sentences comparing había, estaba, era, and tenía.
          For each pair:
          - First sentence should use one of these verbs (había/estaba/era/tenía)
          - Second sentence should use a different one, showing contrast
          - Include English translations
          - Add a brief explanation of when to use each verb
          - Use natural, everyday Mexican Spanish vocabulary

          Key distinctions to show:
          - había = there was/were (existence/presence)
          - estaba = was/were (location, temporary state)
          - era = was/were (permanent characteristics, identity, time)
          - tenía = had/used to have (possession, age)
          ${contextPrompt}

          Return the response as a JSON array with this format:
          [
            {
              "first": {
                "spanish": "Sentence with había/estaba/era/tenía",
                "english": "English translation"
              },
              "second": {
                "spanish": "Sentence with different verb",
                "english": "English translation"
              },
              "explanation": "Brief explanation of why each verb is used"
            }
          ]

          Return ONLY the JSON array, no other text.`;
          break;

        case 'reflexiveVerbs':
          prompt = `Generate 3 pairs of Spanish sentences comparing reflexive and non-reflexive verb forms.
          For each pair:
          - First sentence should use the non-reflexive form
          - Second sentence should use the reflexive form (with "se")
          - Show clear contrast in meaning
          - Include English translations
          - Add a brief explanation of the difference
          - Use natural, everyday Mexican Spanish vocabulary
          - Mix different verb pairs from this list: caer/caerse, poner/ponerse, llevar/llevarse, sentir/sentirse, echar/echarse, parecer/parecerse, quedar/quedarse
          - Use different tenses (present, preterite, imperfect, etc.)
          ${contextPrompt}

          Key concepts to demonstrate:
          - caer (to fall) vs caerse (to fall down/over)
          - poner (to put/place) vs ponerse (to put on/become)
          - llevar (to carry/wear) vs llevarse (to take away/get along)
          - sentir (to feel/regret) vs sentirse (to feel)
          - echar (to throw/pour) vs echarse (to lie down)
          - parecer (to seem) vs parecerse (to resemble)
          - quedar (to remain/be left) vs quedarse (to stay)

          Return the response as a JSON array with this format:
          [
            {
              "first": {
                "spanish": "Sentence without reflexive (e.g., Ella pone la mesa todos los días)",
                "english": "English translation"
              },
              "second": {
                "spanish": "Sentence with reflexive (e.g., Ella se pone el vestido rojo)",
                "english": "English translation"
              },
              "explanation": "Brief explanation of the difference in meaning"
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

        case 'imperfectVerbs':
          prompt = `Generate 5 Spanish sentences for había/estaba/era/tenía practice.
          For each sentence:
          - Create a sentence that clearly requires one of these verbs
          - Replace the verb with _____
          - Provide the correct verb as the answer
          - Include English translations
          - Add brief explanations of why that specific verb is correct
          ${contextPrompt}

          Key distinctions:
          - había = there was/were (existence/presence)
          - estaba = was/were (location, temporary state, estar + gerund)
          - era = was/were (permanent characteristics, identity, time, professions)
          - tenía = had/used to have (possession, age, physical sensations)

          Return the response as a JSON array with this format:
          [
            {
              "spanish": "En el parque _____ muchos niños jugando.",
              "english": "In the park there were many children playing.",
              "correctAnswer": "había",
              "options": ["había", "estaba", "era", "tenía"],
              "explanation": "Use 'había' to express existence or presence ('there was/were')"
            }
          ]

          Return ONLY the JSON array, no other text.`;
          break;

        case 'reflexiveVerbs':
          prompt = `Generate 5 Spanish sentences for reflexive vs non-reflexive verb practice.
          For each sentence:
          - Create a sentence requiring either reflexive or non-reflexive form
          - Replace the verb with _____
          - Provide the correct verb form as the answer (with or without "se")
          - Include English translations
          - Add brief explanations of why reflexive or non-reflexive is correct
          - Mix all seven verb pairs: caer/caerse, poner/ponerse, llevar/llevarse, sentir/sentirse, echar/echarse, parecer/parecerse, quedar/quedarse
          - Use varied tenses (present, preterite, imperfect, future, etc.)
          - Include different exercise types: some need reflexive, some need non-reflexive
          ${contextPrompt}

          Key distinctions:
          - caer (to fall) vs caerse (to fall down/over - reflexive)
          - poner (to put/place) vs ponerse (to put on/become - reflexive)
          - llevar (to carry/wear) vs llevarse (to take away/get along - reflexive)
          - sentir (to feel/regret) vs sentirse (to feel a certain way - reflexive)
          - echar (to throw/pour) vs echarse (to lie down/throw oneself - reflexive)
          - parecer (to seem/appear) vs parecerse (to resemble/look like - reflexive)
          - quedar (to remain/be left) vs quedarse (to stay in a place - reflexive)

          Important: Mix both reflexive and non-reflexive forms in the exercises. The options should include both forms with proper conjugation.

          Return the response as a JSON array with this format:
          [
            {
              "spanish": "María _____ el abrigo porque hace frío.",
              "english": "María puts on her coat because it's cold.",
              "correctAnswer": "se pone",
              "options": ["pone", "se pone", "puso", "se puso"],
              "explanation": "Use 'se pone' (reflexive) because she's putting the coat on herself"
            },
            {
              "spanish": "Ella _____ los libros en la mesa.",
              "english": "She puts the books on the table.",
              "correctAnswer": "pone",
              "options": ["pone", "se pone", "puso", "se puso"],
              "explanation": "Use 'pone' (non-reflexive) because she's putting books on the table, not on herself"
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
                          <div className="flex-1">
                            <p className="text-gray-900 dark:text-white font-medium">
                              {pair.first.spanish}
                            </p>
                            <p className="text-indigo-600 dark:text-indigo-400 text-xs font-mono mt-1">
                              {textToIPA(pair.first.spanish)}
                            </p>
                          </div>
                          <SpanishAudioPlayer text={pair.first.spanish} />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {pair.first.english}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-gray-900 dark:text-white font-medium">
                              {pair.second.spanish}
                            </p>
                            <p className="text-indigo-600 dark:text-indigo-400 text-xs font-mono mt-1">
                              {textToIPA(pair.second.spanish)}
                            </p>
                          </div>
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
                      <div>
                        <div className="flex items-center gap-4">
                          <p className="text-gray-900 dark:text-white flex-1">
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
                        <p className="text-indigo-600 dark:text-indigo-400 text-xs font-mono mt-1">
                          {textToIPA(sentence.spanish.replace('_____', topic.userAnswers[index] || '...'))}
                        </p>
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