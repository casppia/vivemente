import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTopicStore } from '../store/useTopicStore';
import { useFrequencyStore } from '../store/useFrequencyStore';
import { generateText } from '../utils/openai';
import { Example, TopicSection } from '../types/topic';
import { WordAnalysis } from '../components/WordAnalysis';
import { SavedWordsList } from '../components/SavedWordsList';
import { FrequencySelector } from '../components/FrequencySelector';
import { TenseDescription } from '../components/TenseDescription';
import { TENSE_DESCRIPTIONS } from '../types/tenses';

export function TopicPage() {
  const { id, sectionId } = useParams();
  const navigate = useNavigate();
  const { topics } = useTopicStore();
  const { selectedFrequency } = useFrequencyStore();
  const [examples, setExamples] = useState<Example[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topic = topics.find(t => t.id === Number(id));
  const section = topic?.sections.find(s => s.id === sectionId);

  // Show tense descriptions for verb-related topics
  const isVerbTopic = topic?.title.toLowerCase().includes('tense') || 
                     topic?.title.toLowerCase().includes('subjunctive') ||
                     topic?.title.toLowerCase().includes('mood');

  const relevantTenses = isVerbTopic && topic 
    ? TENSE_DESCRIPTIONS.filter(tense => 
        topic.title.toLowerCase().includes(tense.name.toLowerCase()) ||
        section?.title.toLowerCase().includes(tense.name.toLowerCase())
      )
    : [];

  if (!topic) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 mr-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="text-gray-900 dark:text-white" size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Topic not found
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          The requested topic could not be found. Please check the URL and try again.
        </p>
      </div>
    );
  }

  const handleBack = () => {
    navigate(-1);
  };

  const generateExamples = async () => {
    setLoading(true);
    setError(null);

    try {
      const prompt = `Generate 5 examples of Mexican Spanish sentences at ${topic.level} level focusing on ${
        section ? `${section.title} (${section.content})` : topic.title
      }.

      Vocabulary Requirements:
      - Use words primarily from the top ${selectedFrequency} most frequently used Spanish words
      - For ${selectedFrequency === 1000 ? 'basic' : selectedFrequency === 3000 ? 'intermediate' : 'advanced'} vocabulary level
      
      ${topic.level} Level Requirements:
      - Use vocabulary and grammar structures appropriate for ${topic.level} level
      - Focus on everyday situations and familiar contexts
      - Include some idiomatic expressions but avoid complex ones
      - Keep sentence structure clear and manageable
      
      Each example should:
      - Use common Mexican expressions and vocabulary suitable for ${topic.level} level
      - Include both formal and informal usage when appropriate
      - Be practical and useful in everyday situations
      - Include the English translation
      - Add a brief note about Mexican Spanish usage or ${topic.level} grammar points
      - Highlight key grammar structures relevant to ${topic.level} level
      ${section ? `- Focus specifically on demonstrating ${section.title}` : ''}

      Format each example as JSON with these fields:
      {
        "spanish": "Spanish sentence",
        "english": "English translation",
        "note": "Usage note focusing on grammar points",
        "conjugation": [
          {
            "verb": "conjugated form (e.g. tuviera)",
            "infinitive": "infinitive form (e.g. tener)",
            "tense": "name of tense (e.g. Past Subjunctive)",
            "explanation": "Brief explanation of why this form is used"
          }
        ],
        "analysis": {
          "verbs": ["verb1", "verb2"],
          "nouns": ["noun1", "noun2"],
          "adjectives": ["adj1", "adj2"]
        }
      }

      Return ONLY a JSON array of 5 examples, no other text.`;

      const response = await generateText(prompt, {
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
      });

      const parsedExamples = JSON.parse(response);
      setExamples(parsedExamples);
    } catch (err) {
      console.error('Error generating examples:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate examples. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={handleBack}
          className="p-2 mr-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="text-gray-900 dark:text-white" size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {topic.title}
          </h1>
          {section && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
              {section.title}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Tense Descriptions */}
        {isVerbTopic && relevantTenses.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tense Overview
            </h2>
            {relevantTenses.map((tense) => (
              <TenseDescription key={tense.name} tense={tense} />
            ))}
          </div>
        )}

        {/* Topic Content */}
        <div className="space-y-6">
          {section ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {section.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{section.content}</p>
            </motion.div>
          ) : (
            topic.sections.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{section.content}</p>
              </motion.div>
            ))
          )}
        </div>

        <FrequencySelector />

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`w-full flex items-center justify-center py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          onClick={generateExamples}
          disabled={loading}
        >
          <span className="text-lg font-medium">
            {loading ? 'Generating Examples...' : 'Generate Examples'}
            {section && ` for ${section.title}`}
          </span>
          {loading && (
            <RefreshCw className="ml-2 animate-spin" size={20} />
          )}
        </motion.button>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
          >
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {examples.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {section ? `Examples for ${section.title}` : 'Examples'}
              {' '}(Top {selectedFrequency} Words)
            </h2>
            <div className="space-y-6">
              {examples.map((example, index) => (
                <div key={index}>
                  <WordAnalysis
                    sentence={example.spanish}
                    words={{
                      verbs: example.analysis.verbs.map(v => ({ text: v, type: 'verb', level: topic.level })),
                      nouns: example.analysis.nouns.map(n => ({ text: n, type: 'noun', level: topic.level })),
                      adjectives: example.analysis.adjectives.map(a => ({ text: a, type: 'adjective', level: topic.level })),
                    }}
                    level={topic.level}
                    english={example.english}
                    note={example.note}
                    conjugation={example.conjugation}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <SavedWordsList />
      </div>
    </div>
  );
}