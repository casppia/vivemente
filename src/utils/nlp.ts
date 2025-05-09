import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import { generateText } from './openai';

// Initialize winkNLP with error handling
let nlp: any;
try {
  nlp = winkNLP(model);
} catch (error) {
  console.error('Error initializing winkNLP:', error);
  nlp = null;
}

// Enhanced Spanish POS patterns with more detailed categories
const spanishPatterns = {
  verb: {
    pattern: /^(v|aux|mod|estar|ser|haber|tener|ir|hacer|poder|querer|deber|venir|salir|poner|dar|saber|decir|ver|parecer)|\b(ar|er|ir)$/i,
    tenses: {
      present: /(?:o|as|a|amos|áis|an)$/,
      preterite: /(?:é|aste|ó|amos|asteis|aron|í|iste|ió|imos|isteis|ieron)$/,
      imperfect: /(?:aba|abas|aba|ábamos|abais|aban|ía|ías|ía|íamos|íais|ían)$/,
      future: /(?:aré|arás|ará|aremos|aréis|arán|eré|erás|erá|eremos|eréis|erán|iré|irás|irá|iremos|iréis|irán)$/,
      conditional: /(?:aría|arías|aría|aríamos|aríais|arían|ería|erías|ería|eríamos|eríais|erían|iría|irías|iría|iríamos|iríais|irían)$/,
      subjunctive: /(?:e|es|e|emos|éis|en|a|as|a|amos|áis|an)$/
    },
    persons: {
      firstSingular: /(?:o|é|aba|aré|aría)$/,
      secondSingular: /(?:as|aste|abas|arás|arías)$/,
      thirdSingular: /(?:a|ó|aba|ará|aría)$/,
      firstPlural: /(?:amos|ábamos|aremos|aríamos)$/,
      secondPlural: /(?:áis|asteis|abais|aréis|aríais)$/,
      thirdPlural: /(?:an|aron|aban|arán|arían)$/
    }
  },
  noun: {
    pattern: /^(n|prop|sustantivo|nombre)|[aoe]s?$/i,
    gender: {
      masculine: /(?:o|or|aje|ón)$/,
      feminine: /(?:a|ción|sión|dad|tad|tud|umbre)$/
    },
    number: {
      singular: /[^s]$/,
      plural: /s$/
    }
  },
  adjective: {
    pattern: /^(adj|jj)|(?:ble|oso|osa|ico|ica|ivo|iva|ante|ente|ista|al|ar|il|able|ible|ero|era|ario|aria|ísimo|ísima)s?$/i,
    gender: {
      masculine: /(?:o|or|ón)$/,
      feminine: /(?:a|ora|ona)$/
    },
    number: {
      singular: /[^s]$/,
      plural: /s$/
    },
    degree: {
      positive: /(?:o|a|e)$/,
      comparative: /(?:or|ior)$/,
      superlative: /(?:ísimo|ísima)$/
    }
  },
  adverb: {
    pattern: /^(adv|rb)|(mente)$/i
  },
  preposition: {
    pattern: /^(prep|a|ante|bajo|con|contra|de|desde|en|entre|hacia|hasta|para|por|según|sin|sobre|tras)$/i
  },
  determiner: {
    pattern: /^(det|el|la|los|las|un|una|unos|unas|este|esta|estos|estas|ese|esa|esos|esas|aquel|aquella|aquellos|aquellas)$/i
  },
  pronoun: {
    pattern: /^(pron|yo|tú|él|ella|nosotros|vosotros|ellos|ellas|me|te|se|nos|os|mí|ti|sí|conmigo|contigo|consigo)$/i
  }
};

// Common Spanish words with their base forms
const commonWords = {
  verbs: {
    'soy': 'ser',
    'estoy': 'estar',
    'tengo': 'tener',
    'voy': 'ir',
    'hago': 'hacer',
    'digo': 'decir',
    'vengo': 'venir',
    'pongo': 'poner',
    'salgo': 'salir'
  },
  irregularVerbs: new Set([
    'ser', 'estar', 'ir', 'haber', 'tener', 'hacer', 'poder', 'decir',
    'venir', 'salir', 'poner', 'saber', 'querer', 'dar', 'ver'
  ])
};

export interface AnalyzedWord {
  text: string;
  type: 'verb' | 'noun' | 'adjective' | 'adverb' | 'preposition' | 'determiner' | 'pronoun' | 'other';
  lemma: string;
  translation?: string;
  features: {
    pos: string;
    isNegated?: boolean;
    isQuestion?: boolean;
    gender?: 'masculine' | 'feminine' | 'neutral';
    number?: 'singular' | 'plural';
    person?: 'first' | 'second' | 'third';
    tense?: string;
    mood?: string;
    degree?: 'positive' | 'comparative' | 'superlative';
    definition?: string;
  };
}

export interface SentenceAnalysis {
  text: string;
  translation: string;
  words: AnalyzedWord[];
  entities: Array<{
    text: string;
    type: string;
  }>;
  sentiment: 'positive' | 'negative' | 'neutral';
  culturalNotes?: string[];
}

class SpanishAnalyzer {
  private async getTranslationAndCulturalNotes(text: string): Promise<{ translation: string; culturalNotes: string[] }> {
    try {
      const prompt = `Analyze this Spanish text:
      "${text}"
      
      Provide a response in this JSON format:
      {
        "translation": "English translation",
        "culturalNotes": [
          "Cultural insight 1",
          "Cultural insight 2"
        ]
      }
      
      Focus on:
      - Natural, accurate translation
      - Mexican Spanish specific expressions or words
      - Cultural context and regional variations
      - Interesting idioms or colloquialisms
      
      Return ONLY the JSON object, no other text.`;

      const response = await generateText(prompt, {
        model: 'gpt-3.5-turbo',
        maxTokens: 500,
        temperature: 0.7,
      });

      const result = JSON.parse(response);
      return {
        translation: result.translation || 'Translation unavailable',
        culturalNotes: Array.isArray(result.culturalNotes) ? result.culturalNotes : []
      };
    } catch (error) {
      console.error('Error getting translation and cultural notes:', error);
      return {
        translation: 'Translation unavailable',
        culturalNotes: []
      };
    }
  }

  private getVerbFeatures(word: string): Partial<AnalyzedWord['features']> {
    const normalized = word.toLowerCase();
    const features: AnalyzedWord['features'] = { pos: 'verb' };

    // Check tense
    for (const [tense, pattern] of Object.entries(spanishPatterns.verb.tenses)) {
      if (pattern.test(normalized)) {
        features.tense = tense;
        break;
      }
    }

    // Check person
    for (const [person, pattern] of Object.entries(spanishPatterns.verb.persons)) {
      if (pattern.test(normalized)) {
        features.person = person.replace(/Singular|Plural/, '') as 'first' | 'second' | 'third';
        features.number = person.includes('Plural') ? 'plural' : 'singular';
        break;
      }
    }

    // Determine mood (indicative is default)
    if (features.tense === 'subjunctive') {
      features.mood = 'subjunctive';
    } else {
      features.mood = 'indicative';
    }

    return features;
  }

  private getNounFeatures(word: string): Partial<AnalyzedWord['features']> {
    const normalized = word.toLowerCase();
    const features: AnalyzedWord['features'] = { pos: 'noun' };

    // Determine gender
    for (const [gender, pattern] of Object.entries(spanishPatterns.noun.gender)) {
      if (pattern.test(normalized)) {
        features.gender = gender as 'masculine' | 'feminine';
        break;
      }
    }

    // Determine number
    features.number = spanishPatterns.noun.number.plural.test(normalized) ? 'plural' : 'singular';

    return features;
  }

  private getAdjectiveFeatures(word: string): Partial<AnalyzedWord['features']> {
    const normalized = word.toLowerCase();
    const features: AnalyzedWord['features'] = { pos: 'adjective' };

    // Determine gender
    for (const [gender, pattern] of Object.entries(spanishPatterns.adjective.gender)) {
      if (pattern.test(normalized)) {
        features.gender = gender as 'masculine' | 'feminine';
        break;
      }
    }

    // Determine number
    features.number = spanishPatterns.adjective.number.plural.test(normalized) ? 'plural' : 'singular';

    // Determine degree
    for (const [degree, pattern] of Object.entries(spanishPatterns.adjective.degree)) {
      if (pattern.test(normalized)) {
        features.degree = degree as 'positive' | 'comparative' | 'superlative';
        break;
      }
    }

    return features;
  }

  private getLemma(word: string, type: string): string {
    const normalized = word.toLowerCase();

    // Check common irregular verbs first
    if (type === 'verb') {
      if (normalized in commonWords.verbs) {
        return commonWords.verbs[normalized];
      }

      // Handle regular verb patterns
      for (const [ending, patterns] of Object.entries(spanishPatterns.verb.tenses)) {
        for (const pattern of Object.values(patterns)) {
          if (pattern.test(normalized)) {
            const stem = normalized.replace(pattern, '');
            return stem + 'ar'; // Default to -ar ending
          }
        }
      }
    }

    // For other types, remove common endings
    if (type === 'noun' || type === 'adjective') {
      if (normalized.endsWith('es')) {
        return normalized.slice(0, -2);
      }
      if (normalized.endsWith('s')) {
        return normalized.slice(0, -1);
      }
    }

    return normalized;
  }

  async analyzeSentence(text: string): Promise<SentenceAnalysis> {
    if (!text) {
      return {
        text: '',
        translation: '',
        words: [],
        entities: [],
        sentiment: 'neutral',
        culturalNotes: []
      };
    }

    try {
      // Get translation and cultural notes
      const { translation, culturalNotes } = await this.getTranslationAndCulturalNotes(text);

      // Tokenize the text
      const tokens = text.match(/[\wáéíóúüñÁÉÍÓÚÜÑ]+|[.,!?;:¿¡]/g) || [];

      // Analyze each token
      const words: AnalyzedWord[] = [];
      for (const token of tokens) {
        const normalized = token.toLowerCase();
        let type: AnalyzedWord['type'] = 'other';
        let features: AnalyzedWord['features'] = { pos: 'other' };

        // Determine word type and features
        if (spanishPatterns.verb.pattern.test(normalized)) {
          type = 'verb';
          features = this.getVerbFeatures(normalized);
        } else if (spanishPatterns.noun.pattern.test(normalized)) {
          type = 'noun';
          features = this.getNounFeatures(normalized);
        } else if (spanishPatterns.adjective.pattern.test(normalized)) {
          type = 'adjective';
          features = this.getAdjectiveFeatures(normalized);
        } else if (spanishPatterns.adverb.pattern.test(normalized)) {
          type = 'adverb';
          features = { pos: 'adverb' };
        } else if (spanishPatterns.preposition.pattern.test(normalized)) {
          type = 'preposition';
          features = { pos: 'preposition' };
        } else if (spanishPatterns.determiner.pattern.test(normalized)) {
          type = 'determiner';
          features = { pos: 'determiner' };
        } else if (spanishPatterns.pronoun.pattern.test(normalized)) {
          type = 'pronoun';
          features = { pos: 'pronoun' };
        }

        // Get lemma
        const lemma = this.getLemma(normalized, type);

        // Add word analysis
        words.push({
          text: token,
          type,
          lemma,
          features: {
            ...features,
            isNegated: text.includes('no '),
            isQuestion: text.includes('¿')
          }
        });
      }

      return {
        text,
        translation,
        words,
        entities: [],
        sentiment: this.analyzeSentiment(text),
        culturalNotes
      };
    } catch (error) {
      console.error('Error in analyzeSentence:', error);
      return {
        text,
        translation: 'Translation unavailable',
        words: [],
        entities: [],
        sentiment: 'neutral',
        culturalNotes: []
      };
    }
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = new Set([
      'bueno', 'excelente', 'feliz', 'alegre', 'maravilloso',
      'genial', 'fantástico', 'increíble', 'hermoso', 'perfecto'
    ]);
    
    const negativeWords = new Set([
      'malo', 'terrible', 'triste', 'horrible', 'pésimo',
      'fatal', 'peor', 'difícil', 'feo', 'desagradable'
    ]);
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    for (const word of words) {
      if (positiveWords.has(word)) score++;
      if (negativeWords.has(word)) score--;
    }
    
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }
}

export const spanishAnalyzer = new SpanishAnalyzer();