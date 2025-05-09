import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Info } from 'lucide-react';
import { SUBJECTS } from '../types/text';
import { CEFR_LEVELS } from '../types/level';
import { useTextStore } from '../store/useTextStore';
import { AnalyzedText } from './AnalyzedText';
import { TextStats } from './TextStats';

const TENSE_OPTIONS = [
  { value: 'any', label: 'Any Tense' },
  { value: 'present', label: 'Present Simple', examples: ['hablo', 'comes', 'vive'] },
  { value: 'preterite', label: 'Preterite (Simple Past)', examples: ['hablé', 'comiste', 'vivió'] },
  { value: 'imperfect', label: 'Imperfect', examples: ['hablaba', 'comías', 'vivía'] },
  { value: 'present_perfect', label: 'Present Perfect', examples: ['he hablado', 'has comido', 'ha vivido'] },
  { value: 'future', label: 'Future Simple', examples: ['hablaré', 'comerás', 'vivirá'] },
  { value: 'conditional', label: 'Conditional', examples: ['hablaría', 'comerías', 'viviría'] },
];

const TENSE_DESCRIPTIONS = {
  present: {
    usage: [
      'Express habitual actions',
      'State general truths',
      'Talk about current situations',
      'Describe ongoing events'
    ],
    markers: ['siempre', 'todos los días', 'normalmente', 'ahora', 'generalmente']
  },
  preterite: {
    usage: [
      'Completed actions in the past',
      'Single events with clear start/end',
      'Sequential actions',
      'Specific moments'
    ],
    markers: ['ayer', 'anoche', 'la semana pasada', 'hace dos días', 'en 1999']
  },
  imperfect: {
    usage: [
      'Ongoing past actions',
      'Habitual past actions',
      'Past descriptions',
      'Setting the scene'
    ],
    markers: ['antes', 'frecuentemente', 'siempre', 'todos los días', 'mientras']
  },
  present_perfect: {
    usage: [
      'Recent past actions',
      'Past with present relevance',
      'Life experiences',
      'Unfinished time periods'
    ],
    markers: ['hoy', 'esta semana', 'últimamente', 'nunca', 'ya']
  },
  future: {
    usage: [
      'Future predictions',
      'Plans and intentions',
      'Promises',
      'Probability'
    ],
    markers: ['mañana', 'la próxima semana', 'el año que viene', 'dentro de']
  },
  conditional: {
    usage: [
      'Hypothetical situations',
      'Polite requests',
      'Future in the past',
      'Suggestions'
    ],
    markers: ['si pudiera', 'me gustaría', 'quisiera', 'probablemente']
  }
};

export function TextGenerator() {
  const {
    selectedSubject,
    selectedLevel,
    customTopic,
    generatedText,
    isGenerating,
    error,
    setSelectedSubject,
    setSelectedLevel,
    setCustomTopic,
    generateContent,
    clearError,
  } = useTextStore();

  const [showSubjectInfo, setShowSubjectInfo] = useState<string | null>(null);
  const [selectedTense, setSelectedTense] = useState('any');

  const handleGenerate = async () => {
    if (!selectedSubject || (selectedSubject === 'Custom' && !customTopic.trim())) {
      return;
    }

    const topic = selectedSubject === 'Custom' ? customTopic : selectedSubject;
    const selectedSubjectData = SUBJECTS.find(s => s.value === selectedSubject);
    const tenseInfo = selectedTense !== 'any' ? TENSE_DESCRIPTIONS[selectedTense as keyof typeof TENSE_DESCRIPTIONS] : null;
    const tenseOption = TENSE_OPTIONS.find(t => t.value === selectedTense);

    const tenseInstruction = selectedTense !== 'any' 
      ? `\n\nIMPORTANT TENSE INSTRUCTIONS:
         - Use predominantly (at least 80%) the ${tenseOption?.label}
         - Example conjugations: ${tenseOption?.examples.join(', ')}
         
         Usage contexts:
         ${tenseInfo?.usage.map(u => `- ${u}`).join('\n         ')}
         
         Common time markers:
         ${tenseInfo?.markers.map(m => `- ${m}`).join('\n         ')}
         
         Requirements:
         - Focus on demonstrating correct usage of this tense
         - Only use other tenses when absolutely necessary for natural expression
         - Ensure proper agreement and conjugation throughout the text
         - Include at least 3 different verbs in ${tenseOption?.label}`
      : '';

    let prompt;
    if (selectedSubjectData?.promptTemplate) {
      prompt = selectedSubjectData.promptTemplate.replace('{level}', selectedLevel) + tenseInstruction;
    } else {
      prompt = `Generate 2-3 paragraphs about ${topic} in Spanish strictly following ${selectedLevel} CEFR level guidelines.${tenseInstruction}

      Return the response as a JSON object with this format:
      {
        "spanish": ["paragraph1", "paragraph2"],
        "english": ["translation1", "translation2"]
      }

      Requirements:
      - Maintain natural flow and coherence
      - Use appropriate vocabulary for ${selectedLevel} level
      - Ensure grammatical accuracy
      - Include varied sentence structures
      - Focus on positive aspects and developments
      - Return ONLY the JSON object, no other text`;
    }

    await generateContent(prompt);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Text Generation
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select a topic and level to generate Spanish text
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Topic
          </label>
          <div className="relative">
            <select
              value={selectedSubject || ''}
              onChange={(e) => {
                setSelectedSubject(e.target.value as any);
                setShowSubjectInfo(e.target.value);
              }}
              onBlur={() => setShowSubjectInfo(null)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white appearance-none"
            >
              <option value="">Select a topic</option>
              {SUBJECTS.map((subject) => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <Info className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          {showSubjectInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 top-full mt-1 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {SUBJECTS.find(s => s.value === showSubjectInfo)?.description}
              </p>
            </motion.div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Level
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as any)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          >
            {CEFR_LEVELS.map((level) => (
              <option key={level.name} value={level.name}>
                {level.name} - {level.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Verb Tense
          </label>
          <select
            value={selectedTense}
            onChange={(e) => setSelectedTense(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          >
            {TENSE_OPTIONS.map((tense) => (
              <option key={tense.value} value={tense.value}>
                {tense.label}
              </option>
            ))}
          </select>
          {selectedTense !== 'any' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm"
            >
              <p className="text-gray-600 dark:text-gray-400">
                Example forms: {TENSE_OPTIONS.find(t => t.value === selectedTense)?.examples.join(', ')}
              </p>
            </motion.div>
          )}
        </div>

        {selectedSubject === 'Custom' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Topic
            </label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Write your topic..."
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        )}

        <div className="md:col-span-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedSubject || (selectedSubject === 'Custom' && !customTopic.trim())}
            className={`w-full flex items-center justify-center px-6 py-3 rounded-lg text-white transition-colors ${
              isGenerating || !selectedSubject || (selectedSubject === 'Custom' && !customTopic.trim())
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Text'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={clearError}
            className="mt-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {generatedText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-6"
        >
          <TextStats stats={{
            verbs: generatedText.analysis.verbs.length,
            nouns: generatedText.analysis.nouns.length,
            adjectives: generatedText.analysis.adjectives.length,
            total: generatedText.words.length,
          }} />
          
          {generatedText.spanish.map((paragraph, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
            >
              <AnalyzedText
                text={paragraph}
                words={generatedText.words}
                level={selectedLevel}
                translation={generatedText.english[index]}
              />
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}