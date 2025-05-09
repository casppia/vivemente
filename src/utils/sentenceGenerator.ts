import { CEFRLevel } from '../types/level';

interface TemplateData {
  historical: Array<{
    event: string;
    year: number;
    location: string;
  }>;
  scientific: Array<{
    discovery: string;
    year: number;
    scientist: string;
  }>;
  cultural: Array<{
    achievement: string;
    person: string;
    field: string;
  }>;
  geographical: Array<{
    location: string;
    fact: string;
    country: string;
  }>;
}

const templateData: TemplateData = {
  historical: [
    { event: "la Revolución Mexicana", year: 1910, location: "México" },
    { event: "la construcción del Canal de Panamá", year: 1914, location: "Panamá" },
    { event: "la independencia de Argentina", year: 1816, location: "Buenos Aires" },
  ],
  scientific: [
    { discovery: "la teoría de la relatividad", year: 1915, scientist: "Einstein" },
    { discovery: "la penicilina", year: 1928, scientist: "Fleming" },
    { discovery: "el ADN", year: 1953, scientist: "Watson y Crick" },
  ],
  cultural: [
    { achievement: "Cien años de soledad", person: "Gabriel García Márquez", field: "literatura" },
    { achievement: "el muralismo mexicano", person: "Diego Rivera", field: "arte" },
    { achievement: "el realismo mágico", person: "Jorge Luis Borges", field: "literatura" },
  ],
  geographical: [
    { location: "Machu Picchu", fact: "ciudad antigua de los incas", country: "Perú" },
    { location: "la Patagonia", fact: "región más austral de Sudamérica", country: "Argentina y Chile" },
    { location: "el Salar de Uyuni", fact: "desierto de sal más grande del mundo", country: "Bolivia" },
  ],
};

interface SentencePattern {
  template: string;
  complexity: 'simple' | 'compound' | 'complex';
  minLevel: CEFRLevel;
}

const sentencePatterns: SentencePattern[] = [
  {
    template: "En {year}, {event} cambió la historia de {location}.",
    complexity: 'simple',
    minLevel: 'A2',
  },
  {
    template: "Si hubieras estado en {location} en {year}, habrías presenciado {event}.",
    complexity: 'complex',
    minLevel: 'B2',
  },
  {
    template: "{scientist} descubrió {discovery} en {year}, y este hallazgo revolucionó la ciencia.",
    complexity: 'compound',
    minLevel: 'B1',
  },
  {
    template: "Aunque {person} es famoso por {achievement}, su contribución al {field} va mucho más allá.",
    complexity: 'complex',
    minLevel: 'B2',
  },
  {
    template: "{location}, ubicado en {country}, es conocido por ser {fact}.",
    complexity: 'simple',
    minLevel: 'A2',
  },
  {
    template: "Mientras estudiaba {discovery}, {scientist} no imaginaba el impacto que tendría su investigación.",
    complexity: 'complex',
    minLevel: 'C1',
  },
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function isLevelSufficient(requiredLevel: CEFRLevel, userLevel: CEFRLevel): boolean {
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  return levels.indexOf(userLevel) >= levels.indexOf(requiredLevel);
}

export function generateExample(level: CEFRLevel): string {
  // Filter patterns appropriate for the user's level
  const availablePatterns = sentencePatterns.filter(pattern => 
    isLevelSufficient(pattern.minLevel, level)
  );

  if (availablePatterns.length === 0) {
    return "Lo siento, no hay ejemplos disponibles para este nivel.";
  }

  // Select a random pattern
  const pattern = getRandomElement(availablePatterns);
  
  // Choose appropriate data based on the pattern
  let sentence = pattern.template;
  
  // Replace placeholders with actual data
  if (sentence.includes('{event}')) {
    const data = getRandomElement(templateData.historical);
    sentence = sentence
      .replace('{event}', data.event)
      .replace('{year}', data.year.toString())
      .replace('{location}', data.location);
  } else if (sentence.includes('{discovery}')) {
    const data = getRandomElement(templateData.scientific);
    sentence = sentence
      .replace('{discovery}', data.discovery)
      .replace('{year}', data.year.toString())
      .replace('{scientist}', data.scientist);
  } else if (sentence.includes('{achievement}')) {
    const data = getRandomElement(templateData.cultural);
    sentence = sentence
      .replace('{achievement}', data.achievement)
      .replace('{person}', data.person)
      .replace('{field}', data.field);
  } else if (sentence.includes('{location}')) {
    const data = getRandomElement(templateData.geographical);
    sentence = sentence
      .replace('{location}', data.location)
      .replace('{country}', data.country)
      .replace('{fact}', data.fact);
  }

  return sentence;
}

export function generateMultipleExamples(level: CEFRLevel, count: number = 3): string[] {
  const examples: string[] = [];
  const usedPatterns = new Set<string>();

  while (examples.length < count) {
    const example = generateExample(level);
    if (!usedPatterns.has(example)) {
      examples.push(example);
      usedPatterns.add(example);
    }
  }

  return examples;
}