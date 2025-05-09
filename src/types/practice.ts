import { CEFRLevel } from './level';

export interface VerbTense {
  name: string;
  level: CEFRLevel;
  description: string;
}

export interface PracticeSentence {
  spanish: string;
  english: string;
  verb: {
    infinitive: string;
    correctForm: string;
    subject: string;
    tense: string;
  };
  context: string;
}

export interface TensePracticeStats {
  tenseName: string;
  level: CEFRLevel;
  practiceCount: number;
  lastPracticed?: number;
}

export const LEVEL_TENSES: Record<CEFRLevel, VerbTense[]> = {
  'A1': [
    {
      name: 'Present Simple',
      level: 'A1',
      description: 'Basic present tense for everyday actions and facts'
    }
  ],
  'A2': [
    {
      name: 'Present Simple',
      level: 'A2',
      description: 'Regular and irregular verbs in present tense'
    },
    {
      name: 'Preterite',
      level: 'A2',
      description: 'Simple past tense for completed actions'
    }
  ],
  'B1': [
    {
      name: 'Present Simple',
      level: 'B1',
      description: 'Advanced uses of present tense'
    },
    {
      name: 'Preterite',
      level: 'B1',
      description: 'Complex past actions and sequences'
    },
    {
      name: 'Imperfect',
      level: 'B1',
      description: 'Past descriptions and habitual actions'
    },
    {
      name: 'Present Perfect',
      level: 'B1',
      description: 'Recent past and experiences'
    }
  ],
  'B2': [
    {
      name: 'Present Simple',
      level: 'B2',
      description: 'Nuanced uses of present tense'
    },
    {
      name: 'Preterite',
      level: 'B2',
      description: 'Narrative past actions'
    },
    {
      name: 'Imperfect',
      level: 'B2',
      description: 'Complex past descriptions'
    },
    {
      name: 'Present Perfect',
      level: 'B2',
      description: 'Detailed experiences and recent events'
    },
    {
      name: 'Past Perfect',
      level: 'B2',
      description: 'Actions before another past action'
    },
    {
      name: 'Present Subjunctive',
      level: 'B2',
      description: 'Expressing wishes and doubts'
    }
  ],
  'C1': [
    {
      name: 'All Previous Tenses',
      level: 'C1',
      description: 'Advanced applications'
    },
    {
      name: 'Past Subjunctive',
      level: 'C1',
      description: 'Hypothetical past situations'
    },
    {
      name: 'Future Perfect',
      level: 'C1',
      description: 'Future completed actions'
    }
  ],
  'C2': [
    {
      name: 'All Tenses',
      level: 'C2',
      description: 'Mastery of all tenses and moods'
    }
  ]
};