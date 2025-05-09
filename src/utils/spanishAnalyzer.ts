import { spanishAnalyzer } from './nlp';
import { generateText } from './openai';

const VERB_ENDINGS = /(?:ar|er|ir|ando|endo|ado|ido|aré|erá|irá|aba|ía|é|ó|aste|aron)$/;
const ADJECTIVE_ENDINGS = /(?:oso|osa|able|ible|ante|ente|ico|ica|ivo|iva)s?$/;

// Spanish verb conjugation patterns
const CONJUGATION_PATTERNS = {
  ar: {
    infinitive: /ar$/,
    conjugated: [
      /(?:o|as|a|amos|áis|an)$/,  // Present
      /(?:é|aste|ó|amos|asteis|aron)$/,  // Preterite
      /(?:aba|abas|aba|ábamos|abais|aban)$/,  // Imperfect
      /(?:aré|arás|ará|aremos|aréis|arán)$/,  // Future
    ]
  },
  er: {
    infinitive: /er$/,
    conjugated: [
      /(?:o|es|e|emos|éis|en)$/,  // Present
      /(?:í|iste|ió|imos|isteis|ieron)$/,  // Preterite
      /(?:ía|ías|ía|íamos|íais|ían)$/,  // Imperfect
      /(?:eré|erás|erá|eremos|eréis|erán)$/,  // Future
    ]
  },
  ir: {
    infinitive: /ir$/,
    conjugated: [
      /(?:o|es|e|imos|ís|en)$/,  // Present
      /(?:í|iste|ió|imos|isteis|ieron)$/,  // Preterite
      /(?:ía|ías|ía|íamos|íais|ían)$/,  // Imperfect
      /(?:iré|irás|irá|iremos|iréis|irán)$/,  // Future
    ]
  }
};

// Function to get verb infinitive form
function getVerbInfinitive(word: string): string {
  const normalized = word.toLowerCase();
  
  // Common irregular verbs
  const irregularVerbs: Record<string, string[]> = {
    'ser': ['soy', 'eres', 'es', 'somos', 'sois', 'son', 'fui', 'fue', 'era', 'será'],
    'estar': ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están', 'estuve', 'estuvo', 'estaba', 'estará'],
    'ir': ['voy', 'vas', 'va', 'vamos', 'vais', 'van', 'fui', 'fue', 'iba', 'irá'],
    'haber': ['he', 'has', 'ha', 'hemos', 'habéis', 'han', 'hube', 'hubo', 'había', 'habrá'],
    'tener': ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen', 'tuve', 'tuvo', 'tenía', 'tendrá']
  };

  // Check irregular verbs first
  for (const [infinitive, forms] of Object.entries(irregularVerbs)) {
    if (forms.includes(normalized)) {
      return infinitive;
    }
  }

  // Check regular patterns
  for (const [ending, patterns] of Object.entries(CONJUGATION_PATTERNS)) {
    // If it's already in infinitive form
    if (patterns.infinitive.test(normalized)) {
      return normalized;
    }

    // Check conjugated forms
    for (const pattern of patterns.conjugated) {
      if (pattern.test(normalized)) {
        // Remove conjugation and add infinitive ending
        const stem = normalized.replace(pattern, '');
        return stem + ending;
      }
    }
  }

  // If no pattern matches, return the original word
  return word;
}

export async function analyzeSpanishWord(word: string): Promise<'verb' | 'noun' | 'adjective'> {
  if (!word) {
    return 'noun';
  }

  try {
    const normalized = word.toLowerCase().trim();
    
    // Regex-based analysis as primary method
    if (VERB_ENDINGS.test(normalized)) {
      return 'verb';
    }
    
    if (ADJECTIVE_ENDINGS.test(normalized)) {
      return 'adjective';
    }

    // Use winkNLP analysis as backup
    try {
      const analysis = await spanishAnalyzer.analyzeSentence(word);
      if (analysis.words.length > 0) {
        const type = analysis.words[0].type;
        if (type === 'verb' || type === 'noun' || type === 'adjective') {
          return type;
        }
      }
    } catch (nlpError) {
      console.warn('NLP analysis failed, falling back to basic analysis:', nlpError);
    }

    // If all else fails, try to get analysis from OpenAI
    try {
      const prompt = `Analyze this Spanish word: "${word}"
      
      Return ONLY one of these values: "verb", "noun", or "adjective"
      Choose the most likely part of speech for this word in isolation.`;

      const response = await generateText(prompt, {
        model: 'gpt-3.5-turbo',
        maxTokens: 10,
        temperature: 0.3,
      });

      const type = response.trim().toLowerCase().replace(/['"]/g, '');
      if (type === 'verb' || type === 'noun' || type === 'adjective') {
        return type;
      }
    } catch (aiError) {
      console.warn('AI analysis failed:', aiError);
    }

    return 'noun';
  } catch (error) {
    console.error('Error analyzing word:', error);
    return 'noun';
  }
}

export async function getWordDefinition(word: string, type: string): Promise<string> {
  if (!word || !type) {
    return 'No definition available';
  }

  try {
    // For verbs, get the infinitive form
    const processedWord = type === 'verb' ? getVerbInfinitive(word) : word;

    const prompt = `Define this Spanish word: "${processedWord}" (${type})
    
    Provide a brief, clear definition suitable for language learners.
    Include the base form for verbs.
    Return ONLY the definition, no other text.`;

    const definition = await generateText(prompt, {
      model: 'gpt-3.5-turbo',
      maxTokens: 50,
      temperature: 0.3,
    });

    return definition.trim();
  } catch (error) {
    console.error('Error getting word definition:', error);
    return `${word} (${type})`;
  }
}

export async function getWordTranslation(word: string): Promise<string> {
  if (!word) {
    return 'No translation available';
  }

  try {
    // For verbs, get the infinitive form first
    const processedWord = VERB_ENDINGS.test(word.toLowerCase()) ? 
      getVerbInfinitive(word) : word;

    const prompt = `Translate this Spanish word to English: "${processedWord}"
    If it's a verb, provide the infinitive form.
    Return ONLY the English translation, no other text.`;

    const translation = await generateText(prompt, {
      model: 'gpt-3.5-turbo',
      maxTokens: 20,
      temperature: 0.3,
    });

    return `Translation: ${translation.trim()}`;
  } catch (error) {
    console.error('Error getting word translation:', error);
    return `Translation: ${word}`;
  }
}