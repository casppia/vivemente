import { CEFRLevel } from './level';

export type Subject = 
  | 'Current News'
  | 'Science & Innovation'
  | 'Environmental Progress'
  | 'Health & Wellness'
  | 'Technology & AI'
  | 'Education & Learning'
  | 'Community & Culture'
  | 'Sports & Recreation'
  | 'Literature'
  | 'History'
  | 'Custom';

export type WordType = 'verb' | 'noun' | 'adjective';

export interface SubjectOption {
  value: Subject;
  label: string;
  description: string;
  promptTemplate?: string;
}

export const SUBJECTS: SubjectOption[] = [
  {
    value: 'Current News',
    label: 'Noticias Actuales',
    description: 'Desarrollos positivos en la sociedad y logros humanitarios',
    promptTemplate: `Generate 2-3 paragraphs about recent positive developments in society in Spanish at {level} level.
      Focus on:
      - Breakthrough solutions to social challenges
      - Humanitarian achievements and success stories
      - Positive community initiatives
      - Beneficial social innovations
      - Progress in social justice and equality

      Return the response as a JSON object with this format:
      {
        "spanish": ["paragraph1", "paragraph2"],
        "english": ["translation1", "translation2"]
      }

      Requirements:
      - Maintain natural flow and coherence
      - Use appropriate vocabulary for {level} level
      - Ensure grammatical accuracy
      - Include varied sentence structures
      - Keep an optimistic tone
      - Return ONLY the JSON object, no other text`
  },
  {
    value: 'Science & Innovation',
    label: 'Ciencia e Innovación',
    description: 'Descubrimientos científicos y avances tecnológicos',
    promptTemplate: `Generate 2-3 paragraphs about recent scientific discoveries and innovations in Spanish at {level} level.
      Focus on:
      - Groundbreaking scientific discoveries
      - Space exploration achievements
      - Medical research breakthroughs
      - Technological innovations improving lives
      - Environmental science solutions

      Return the response as a JSON object with this format:
      {
        "spanish": ["paragraph1", "paragraph2"],
        "english": ["translation1", "translation2"]
      }

      Requirements:
      - Maintain natural flow and coherence
      - Use appropriate vocabulary for {level} level
      - Ensure grammatical accuracy
      - Include varied sentence structures
      - Keep an optimistic tone
      - Return ONLY the JSON object, no other text`
  },
  {
    value: 'Environmental Progress',
    label: 'Progreso Ambiental',
    description: 'Éxitos en conservación y energías renovables',
    promptTemplate: `Generate 2-3 paragraphs about environmental conservation successes in Spanish at {level} level.
      Focus on:
      - Conservation success stories
      - Renewable energy achievements
      - Sustainability initiatives
      - Species recovery programs
      - Clean technology innovations

      Return the response as a JSON object with this format:
      {
        "spanish": ["paragraph1", "paragraph2"],
        "english": ["translation1", "translation2"]
      }

      Requirements:
      - Maintain natural flow and coherence
      - Use appropriate vocabulary for {level} level
      - Ensure grammatical accuracy
      - Include varied sentence structures
      - Keep an optimistic tone
      - Return ONLY the JSON object, no other text`
  },
  {
    value: 'Health & Wellness',
    label: 'Salud y Bienestar',
    description: 'Avances médicos y tendencias de bienestar',
    promptTemplate: `Generate 2-3 paragraphs about health and wellness advancements in Spanish at {level} level.
      Focus on:
      - Medical breakthroughs and treatments
      - Public health improvements
      - Wellness innovations
      - Mental health progress
      - Healthcare accessibility achievements

      Return the response as a JSON object with this format:
      {
        "spanish": ["paragraph1", "paragraph2"],
        "english": ["translation1", "translation2"]
      }

      Requirements:
      - Maintain natural flow and coherence
      - Use appropriate vocabulary for {level} level
      - Ensure grammatical accuracy
      - Include varied sentence structures
      - Keep an optimistic tone
      - Return ONLY the JSON object, no other text`
  },
  {
    value: 'Technology & AI',
    label: 'Tecnología e IA',
    description: 'Aplicaciones beneficiosas de la IA y innovaciones digitales',
    promptTemplate: `Generate 2-3 paragraphs about positive technological developments in Spanish at {level} level.
      Focus on:
      - Beneficial AI applications
      - Digital innovations improving lives
      - Tech solutions for social good
      - Advances in robotics and automation
      - Educational technology progress

      Return the response as a JSON object with this format:
      {
        "spanish": ["paragraph1", "paragraph2"],
        "english": ["translation1", "translation2"]
      }

      Requirements:
      - Maintain natural flow and coherence
      - Use appropriate vocabulary for {level} level
      - Ensure grammatical accuracy
      - Include varied sentence structures
      - Keep an optimistic tone
      - Return ONLY the JSON object, no other text`
  },
  {
    value: 'Education & Learning',
    label: 'Educación y Aprendizaje',
    description: 'Innovaciones educativas y logros académicos',
    promptTemplate: `Generate 2-3 paragraphs about educational innovations in Spanish at {level} level.
      Focus on:
      - Learning breakthroughs
      - Educational technology advances
      - Academic achievements
      - Teaching innovations
      - Access to education improvements

      Return the response as a JSON object with this format:
      {
        "spanish": ["paragraph1", "paragraph2"],
        "english": ["translation1", "translation2"]
      }

      Requirements:
      - Maintain natural flow and coherence
      - Use appropriate vocabulary for {level} level
      - Ensure grammatical accuracy
      - Include varied sentence structures
      - Keep an optimistic tone
      - Return ONLY the JSON object, no other text`
  },
  {
    value: 'Community & Culture',
    label: 'Comunidad y Cultura',
    description: 'Celebraciones culturales e historias de éxito comunitario',
    promptTemplate: `Generate 2-3 paragraphs about cultural and community achievements in Spanish at {level} level.
      Focus on:
      - Cultural celebrations and festivals
      - Community success stories
      - Arts and music achievements
      - Heritage preservation
      - Cross-cultural understanding

      Return the response as a JSON object with this format:
      {
        "spanish": ["paragraph1", "paragraph2"],
        "english": ["translation1", "translation2"]
      }

      Requirements:
      - Maintain natural flow and coherence
      - Use appropriate vocabulary for {level} level
      - Ensure grammatical accuracy
      - Include varied sentence structures
      - Keep an optimistic tone
      - Return ONLY the JSON object, no other text`
  },
  {
    value: 'Sports & Recreation',
    label: 'Deportes y Recreación',
    description: 'Logros deportivos e innovaciones recreativas',
    promptTemplate: `Generate 2-3 paragraphs about sports and recreational achievements in Spanish at {level} level.
      Focus on:
      - Inspiring athletic achievements
      - Team successes and milestones
      - Sports innovation and technology
      - Recreational facilities improvements
      - Youth sports development

      Return the response as a JSON object with this format:
      {
        "spanish": ["paragraph1", "paragraph2"],
        "english": ["translation1", "translation2"]
      }

      Requirements:
      - Maintain natural flow and coherence
      - Use appropriate vocabulary for {level} level
      - Ensure grammatical accuracy
      - Include varied sentence structures
      - Keep an optimistic tone
      - Return ONLY the JSON object, no other text`
  },
  {
    value: 'Literature',
    label: 'Literatura',
    description: 'Literatura hispana y autores famosos',
  },
  {
    value: 'History',
    label: 'Historia',
    description: 'Eventos históricos y culturales',
  },
  {
    value: 'Custom',
    label: 'Tema Personalizado',
    description: 'Escribe tu propio tema',
  },
];

export interface Word {
  text: string;
  type: WordType;
  definition: string;
  translation: string;
  context: string;
  timestamp: number;
}

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

export interface GeneratedText {
  spanish: string[];
  english: string[];
  words: AnalyzedWord[];
  wordsByParagraph?: AnalyzedWord[][];
  savedWords?: Word[];
  analysis: {
    verbs: string[];
    nouns: string[];
    adjectives: string[];
  };
}