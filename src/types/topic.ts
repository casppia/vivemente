import { CEFRLevel } from './level';

export interface TopicSection {
  id: string;
  title: string;
  content: string;
}

export interface Topic {
  id: number;
  level: CEFRLevel;
  category: string;
  title: string;
  spanishTitle: string;
  preview: string[];
  sections: TopicSection[];
}

export interface Example {
  spanish: string;
  english: string;
  note?: string;
  conjugation?: {
    verb: string;
    infinitive: string;
    tense: string;
    explanation?: string;
  }[];
  analysis: {
    verbs: string[];
    nouns: string[];
    adjectives: string[];
  };
}

export interface TopicCategory {
  name: string;
  topics: Topic[];
}