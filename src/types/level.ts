export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LevelInfo {
  name: CEFRLevel;
  title: string;
  description: string;
  color: string;
}

export const CEFR_LEVELS: LevelInfo[] = [
  {
    name: 'A1',
    title: 'Beginner',
    description: 'Basic phrases and everyday expressions',
    color: 'emerald',
  },
  {
    name: 'A2',
    title: 'Elementary',
    description: 'Familiar situations and simple communication',
    color: 'cyan',
  },
  {
    name: 'B1',
    title: 'Intermediate',
    description: 'Main points and routine situations',
    color: 'blue',
  },
  {
    name: 'B2',
    title: 'Upper Intermediate',
    description: 'Complex texts and technical discussions',
    color: 'violet',
  },
  {
    name: 'C1',
    title: 'Advanced',
    description: 'Fluent expression and implicit meaning',
    color: 'purple',
  },
  {
    name: 'C2',
    title: 'Mastery',
    description: 'Precise and nuanced expression',
    color: 'fuchsia',
  },
];