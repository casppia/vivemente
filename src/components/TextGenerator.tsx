import { useState } from 'react';
import { motion } from 'framer-motion';
import { SUBJECTS } from '../types/text';
import { CEFR_LEVELS } from '../types/level';
import { useTextStore } from '../store/useTextStore';
import { containsProfanity, PROFANITY_ERROR_MESSAGE } from '../utils/profanityFilter';
import { SpanishAudioPlayer } from './SpanishAudioPlayer';
import { TextStats } from './TextStats';
import { AnalyzedText } from './AnalyzedText';

const TENSES = [
  { value: 'present', label: 'Present' },
  { value: 'preterite', label: 'Preterite' },
  { value: 'imperfect', label: 'Imperfect' },
  { value: 'future', label: 'Future' },
  { value: 'subjunctive', label: 'Subjunctive' },
] as const;

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
  const [selectedTenses, setSelectedTenses] = useState<string[]>([]);

  const handleTenseToggle = (tenseValue: string) => {
    setSelectedTenses(prev =>
      prev.includes(tenseValue)
        ? prev.filter(t => t !== tenseValue)
        : [...prev, tenseValue]
    );
  };

  const handleGenerate = async () => {
    if (!selectedSubject || (selectedSubject === 'Custom' && !customTopic.trim())) {
      return;
    }

    if (selectedSubject === 'Custom' && containsProfanity(customTopic)) {
      clearError();
      useTextStore.setState({ error: PROFANITY_ERROR_MESSAGE });
      return;
    }

    const topic = selectedSubject === 'Custom' ? customTopic : selectedSubject;
    const selectedSubjectData = SUBJECTS.find(s => s.value === selectedSubject);

    const tenseInstruction = selectedTenses.length > 0
      ? `\n\n**Tense Requirements:**\nFocus on using the following verb tenses in the text: ${selectedTenses.map(t => TENSES.find(tense => tense.value === t)?.label).join(', ')}. Incorporate these tenses naturally throughout the text.`
      : '';

    let prompt;
    if (selectedSubjectData?.promptTemplate) {
      prompt = selectedSubjectData.promptTemplate.replace('{level}', selectedLevel) + tenseInstruction;
    } else {
      prompt = `You are a Spanish language text generator and grammar analyzer. Follow these steps:

**Step 1: Generate Spanish Text**
Generate 2-3 paragraphs about "${topic}" in Spanish, strictly following ${selectedLevel} CEFR level guidelines.${tenseInstruction}

**Step 2: Analyze Grammar - Extract ALL Verbs**
Your task is to identify and extract ALL verbs from the Spanish text, including all verb forms and tenses.

**Instructions:**
1. Analyze the provided Spanish text carefully
2. Identify and extract ALL verbs, including but not limited to:
   - Infinitives (e.g., aumentar, fomentar, implementar)
   - Conjugated verbs in all tenses (e.g., han logrado, ha sido, han contribuido)
   - Compound verb forms (e.g., se han implementado)
   - Auxiliary verbs (haber, ser, estar when used as auxiliaries)
   - Reflexive verbs (e.g., se han implementado)
   - Gerunds and participles when functioning as verbs

**Verb Output format:**
- List each verb as it appears in the text
- Include the complete verb form as it appears
- Include compound forms as complete units (e.g., "han logrado" not separate)
- Do not modify or conjugate the verbs

**Example:**
For text containing "han logrado aumentar la productividad"
Output verbs: ["han logrado", "aumentar"]

Also identify:
- **Adjectives**: ALL descriptive words that modify nouns (e.g., hermoso, grande, interesante, nuevo)
- **Nouns**: ALL naming words including people, places, things, and concepts (e.g., casa, felicidad, profesor, ciudad)

**Step 3: Return JSON Response**
Return a JSON object with this exact format:
{
  "spanish": ["paragraph1", "paragraph2"],
  "english": ["translation1", "translation2"],
  "grammar": {
    "adjectives": ["adjective1", "adjective2", ...],
    "nouns": ["noun1", "noun2", ...],
    "verbs": ["verb1", "verb2", ...]
  }
}

**Important Guidelines:**
- Be thorough and ensure you capture every verb form, regardless of tense, mood, or construction
- Do not miss any verbal expressions
- List each unique word/phrase once per category, even if it appears multiple times
- For compound verbs, include the complete construction
- Maintain natural flow and coherence in the generated text
- Use appropriate vocabulary for ${selectedLevel} level
- Include varied sentence structures
- Focus on positive aspects and developments
- Return ONLY the JSON object, no other text`;
    }

    await generateContent(prompt);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Generate Spanish Text
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Topic
              </span>
              <div className="relative">
                <select
                  value={selectedSubject || ''}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value as any);
                    setShowSubjectInfo(e.target.value);
                  }}
                  onBlur={() => setShowSubjectInfo(null)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-white"
                >
                  <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Select a topic</option>
                  {SUBJECTS.map((subject) => (
                    <option key={subject.value} value={subject.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      {subject.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Level
              </span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as any)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-white"
              >
                {CEFR_LEVELS.map((level) => (
                  <option key={level.name} value={level.name} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    {level.name} - {level.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Verb Tenses (Optional)
              </span>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {TENSES.map((tense) => (
                  <label
                    key={tense.value}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTenses.includes(tense.value)}
                      onChange={() => handleTenseToggle(tense.value)}
                      className="w-4 h-4 text-indigo-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {tense.label}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Select specific tenses to focus on in the generated text
              </p>
            </label>
          </div>

          {selectedSubject === 'Custom' && (
            <div className="md:col-span-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Custom Topic
                </span>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Write your topic..."
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                />
              </label>
            </div>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedSubject || (selectedSubject === 'Custom' && !customTopic.trim())}
          className={`w-full mt-8 flex items-center justify-center px-6 py-3 rounded-xl text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
            isGenerating || !selectedSubject || (selectedSubject === 'Custom' && !customTopic.trim())
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Text'
          )}
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}

      {generatedText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <TextStats stats={{
            verbs: generatedText.analysis.verbs.length,
            nouns: generatedText.analysis.nouns.length,
            adjectives: generatedText.analysis.adjectives.length,
            total: generatedText.words.filter(w =>
              w.type === 'verb' || w.type === 'noun' || w.type === 'adjective' ||
              w.type === 'adverb' || w.type === 'preposition'
            ).length,
            verbsList: generatedText.analysis.verbs,
            nounsList: generatedText.analysis.nouns,
            adjectivesList: generatedText.analysis.adjectives,
          }} />
          
          {generatedText.spanish.map((paragraph, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg space-y-4 hover:shadow-xl transition-shadow"
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