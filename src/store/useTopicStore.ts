import { create } from 'zustand';
import { Topic, TopicCategory } from '../types/topic';
import { CEFRLevel } from '../types/level';

interface TopicState {
  topics: Topic[];
  getTopicsByLevel: (level: CEFRLevel) => TopicCategory[];
}

export const useTopicStore = create<TopicState>((set, get) => ({
  topics: [
    // A2 Topics
    {
      id: 23,
      level: 'A2',
      category: 'Verb Tenses',
      title: 'Present Tense (Indicative)',
      spanishTitle: 'Presente de Indicativo',
      preview: ['Regular verbs', 'Irregular verbs', 'Daily conversations'],
      sections: [
        {
          id: 'regular',
          title: 'Regular Verbs',
          content: 'Formation and use of regular -ar, -er, and -ir verbs in present tense for daily conversations.',
        },
        {
          id: 'irregular',
          title: 'Irregular Verbs',
          content: 'Common irregular verbs like ser, estar, ir, hacer, and their usage in everyday situations.',
        },
        {
          id: 'usage',
          title: 'Daily Usage',
          content: 'Using present tense to talk about routines, facts, and current situations.',
        },
      ],
    },
    {
      id: 24,
      level: 'A2',
      category: 'Verb Tenses',
      title: 'Present Progressive',
      spanishTitle: 'Presente Progresivo',
      preview: ['Formation', 'Current actions', 'Estar + gerund'],
      sections: [
        {
          id: 'formation',
          title: 'Formation',
          content: 'How to form the present progressive using estar + gerund (-ando/-iendo).',
        },
        {
          id: 'usage',
          title: 'Current Actions',
          content: 'Using present progressive to describe actions happening right now (Estoy comiendo).',
        },
        {
          id: 'comparison',
          title: 'Comparison with Simple Present',
          content: 'When to use present progressive vs. simple present tense.',
        },
      ],
    },
    {
      id: 25,
      level: 'A2',
      category: 'Verb Tenses',
      title: 'Simple Past (Preterite)',
      spanishTitle: 'Pretérito Simple',
      preview: ['Regular verbs', 'Common irregulars', 'Completed actions'],
      sections: [
        {
          id: 'regular',
          title: 'Regular Preterite',
          content: 'Formation and use of regular verbs in the preterite tense.',
        },
        {
          id: 'irregular',
          title: 'Common Irregular Verbs',
          content: 'Important irregular verbs in preterite: fui, hice, dije, etc.',
        },
        {
          id: 'usage',
          title: 'Usage',
          content: 'Using preterite for completed actions and specific moments in the past.',
        },
      ],
    },
    {
      id: 26,
      level: 'A2',
      category: 'Basic Sentence Structures',
      title: 'Question Formation',
      spanishTitle: 'Formación de Preguntas',
      preview: ['Yes/No questions', 'Wh- questions', 'Question words'],
      sections: [
        {
          id: 'yesno',
          title: 'Yes/No Questions',
          content: 'Forming simple questions that can be answered with sí or no.',
        },
        {
          id: 'wh',
          title: 'Wh- Questions',
          content: 'Using question words: qué, cuál, cuándo, dónde, etc.',
        },
        {
          id: 'intonation',
          title: 'Question Intonation',
          content: 'Proper intonation patterns for different types of questions.',
        },
      ],
    },
    {
      id: 27,
      level: 'A2',
      category: 'Modal Verbs',
      title: 'Basic Modal Verbs',
      spanishTitle: 'Verbos Modales Básicos',
      preview: ['Poder', 'Querer', 'Tener que'],
      sections: [
        {
          id: 'poder',
          title: 'Poder (Can/May)',
          content: 'Using poder to express ability and ask for permission.',
        },
        {
          id: 'querer',
          title: 'Querer (Want)',
          content: 'Expressing wishes and desires using querer.',
        },
        {
          id: 'tenerque',
          title: 'Tener que (Have to)',
          content: 'Expressing obligation and necessity with tener que.',
        },
      ],
    },
    {
      id: 28,
      level: 'A2',
      category: 'Pronouns',
      title: 'Object Pronouns',
      spanishTitle: 'Pronombres de Objeto',
      preview: ['Direct objects', 'Indirect objects', 'Placement'],
      sections: [
        {
          id: 'direct',
          title: 'Direct Object Pronouns',
          content: 'Using and placing me, te, lo/la, nos, los/las correctly.',
        },
        {
          id: 'indirect',
          title: 'Indirect Object Pronouns',
          content: 'Understanding and using me, te, le, nos, les.',
        },
        {
          id: 'reflexive',
          title: 'Reflexive Pronouns',
          content: 'Using reflexive pronouns with daily routine verbs.',
        },
      ],
    },
    {
      id: 29,
      level: 'A2',
      category: 'Adjectives and Agreement',
      title: 'Adjective Usage',
      spanishTitle: 'Uso de Adjetivos',
      preview: ['Gender agreement', 'Number agreement', 'Comparisons'],
      sections: [
        {
          id: 'agreement',
          title: 'Gender and Number Agreement',
          content: 'Making adjectives agree with nouns in gender and number.',
        },
        {
          id: 'common',
          title: 'Common Adjectives',
          content: 'Frequently used adjectives for colors, sizes, and emotions.',
        },
        {
          id: 'comparisons',
          title: 'Basic Comparisons',
          content: 'Using más que, menos que, and el/la más for comparisons.',
        },
      ],
    },
    {
      id: 30,
      level: 'A2',
      category: 'Prepositions and Adverbs',
      title: 'Basic Prepositions',
      spanishTitle: 'Preposiciones Básicas',
      preview: ['Location', 'Time', 'Common adverbs'],
      sections: [
        {
          id: 'location',
          title: 'Location Prepositions',
          content: 'Using en, sobre, debajo de, al lado de to describe location.',
        },
        {
          id: 'time',
          title: 'Time Expressions',
          content: 'Using antes de, después de, durante for time references.',
        },
        {
          id: 'adverbs',
          title: 'Common Adverbs',
          content: 'Frequently used adverbs like siempre, nunca, a veces.',
        },
      ],
    },
    {
      id: 31,
      level: 'A2',
      category: 'Mexican Spanish Differences',
      title: 'Mexican Spanish Basics',
      spanishTitle: 'Español Mexicano Básico',
      preview: ['Ustedes usage', 'Common expressions', 'Diminutives'],
      sections: [
        {
          id: 'ustedes',
          title: 'Use of Ustedes',
          content: 'Understanding how ustedes replaces vosotros in Mexican Spanish.',
        },
        {
          id: 'expressions',
          title: 'Common Mexican Expressions',
          content: 'Basic expressions like ¿Mande?, órale, and ándale.',
        },
        {
          id: 'diminutives',
          title: 'Diminutives',
          content: 'Using -ito/-ita endings in Mexican Spanish (cafecito, perrito).',
        },
      ],
    },
    // B1 Topics
    {
      id: 1,
      level: 'B1',
      category: 'Verb Tenses and Moods',
      title: 'Present Subjunctive',
      spanishTitle: 'El presente del subjuntivo',
      preview: ['Formation and uses', 'Common expressions', 'Mexican variations'],
      sections: [
        {
          id: 'formation',
          title: 'Formation and uses',
          content: 'The present subjunctive is formed by changing the ending of the present indicative. It is used to express wishes, doubts, emotions, and recommendations.',
        },
        {
          id: 'expressions',
          title: 'Common expressions requiring subjunctive',
          content: 'Common triggers include: querer que, esperar que, recomendar que, and expressions of emotion like me alegra que, me molesta que.',
        },
        {
          id: 'mexican-variations',
          title: 'Mexican variations in subjunctive usage',
          content: 'In Mexican Spanish, the subjunctive is often used with ojalá and certain informal expressions unique to Mexico.',
        },
      ],
    },
    {
      id: 2,
      level: 'B1',
      category: 'Verb Tenses and Moods',
      title: 'Imperfect Tense',
      spanishTitle: 'El imperfecto',
      preview: ['Habitual actions', 'Past descriptions', 'Contrast with preterite'],
      sections: [
        {
          id: 'habitual',
          title: 'Habitual actions in the past',
          content: 'The imperfect tense is used to describe repeated or habitual actions in the past.',
        },
        {
          id: 'descriptions',
          title: 'Descriptions in the past',
          content: 'Used for describing states, emotions, weather, time, and age in the past.',
        },
        {
          id: 'contrast',
          title: 'Contrasting with preterite',
          content: 'Understanding when to use imperfect vs. preterite in narrative contexts.',
        },
      ],
    },
    {
      id: 3,
      level: 'B1',
      category: 'Verb Tenses and Moods',
      title: 'Present Perfect',
      spanishTitle: 'El pretérito perfecto',
      preview: ['Formation with haber', 'Uses in Mexican Spanish', 'Time expressions'],
      sections: [
        {
          id: 'formation-haber',
          title: 'Formation with "haber"',
          content: 'The present perfect is formed using the present tense of haber + past participle.',
        },
        {
          id: 'mexican-uses',
          title: 'Uses in Mexican Spanish vs. Spain Spanish',
          content: 'Mexican Spanish tends to use the preterite more frequently where Spain Spanish would use present perfect.',
        },
        {
          id: 'time-expressions',
          title: 'Time expressions',
          content: 'Common time expressions used with present perfect: hoy, esta semana, últimamente.',
        },
      ],
    },
    {
      id: 4,
      level: 'B1',
      category: 'Verb Tenses and Moods',
      title: 'Future Tense',
      spanishTitle: 'El futuro simple',
      preview: ['Regular forms', 'Irregular forms', 'Alternative expressions'],
      sections: [
        {
          id: 'regular-future',
          title: 'Regular future forms',
          content: 'Formation of regular future tense by adding endings to the infinitive.',
        },
        {
          id: 'irregular-future',
          title: 'Irregular future forms',
          content: 'Common irregular verbs in the future tense and their patterns.',
        },
        {
          id: 'alternative-future',
          title: 'Alternative future expressions',
          content: 'Using ir a + infinitive and present tense for future actions.',
        },
      ],
    },
    {
      id: 5,
      level: 'B1',
      category: 'Verb Tenses and Moods',
      title: 'Conditional Tense',
      spanishTitle: 'El condicional',
      preview: ['Formation', 'Uses', 'Polite requests'],
      sections: [
        {
          id: 'conditional-formation',
          title: 'Formation of conditional',
          content: 'Regular and irregular patterns in forming the conditional tense.',
        },
        {
          id: 'conditional-uses',
          title: 'Uses of conditional',
          content: 'Expressing hypothetical situations and future in the past.',
        },
        {
          id: 'polite-requests',
          title: 'Polite requests',
          content: 'Using conditional for polite requests and suggestions.',
        },
      ],
    },
    {
      id: 6,
      level: 'B1',
      category: 'Pronouns and Prepositions',
      title: 'Object Pronouns',
      spanishTitle: 'Pronombres de objeto',
      preview: ['Direct objects', 'Indirect objects', 'Double object pronouns'],
      sections: [
        {
          id: 'direct-objects',
          title: 'Direct object pronouns',
          content: 'Usage and placement of direct object pronouns in different contexts.',
        },
        {
          id: 'indirect-objects',
          title: 'Indirect object pronouns',
          content: 'Understanding and using indirect object pronouns correctly.',
        },
        {
          id: 'double-objects',
          title: 'Double object pronouns',
          content: 'Combining direct and indirect object pronouns in sentences.',
        },
      ],
    },
    {
      id: 7,
      level: 'B1',
      category: 'Pronouns and Prepositions',
      title: 'Relative Pronouns',
      spanishTitle: 'Pronombres relativos',
      preview: ['Que, quien, donde', 'El que, lo que', 'Mexican variations'],
      sections: [
        {
          id: 'basic-relatives',
          title: 'Basic relative pronouns',
          content: 'Using que, quien, and donde in relative clauses.',
        },
        {
          id: 'compound-relatives',
          title: 'Compound relative pronouns',
          content: 'Understanding el que, la que, lo que, and their uses.',
        },
        {
          id: 'mexican-relatives',
          title: 'Mexican variations',
          content: 'Common patterns of relative pronoun usage in Mexican Spanish.',
        },
      ],
    },
    {
      id: 8,
      level: 'B1',
      category: 'Pronouns and Prepositions',
      title: 'Prepositional Phrases',
      spanishTitle: 'Frases preposicionales',
      preview: ['Por vs. para', 'Common prepositions', 'Mexican expressions'],
      sections: [
        {
          id: 'por-para',
          title: 'Por vs. para',
          content: 'Distinguishing between por and para in different contexts.',
        },
        {
          id: 'common-preps',
          title: 'Common prepositions',
          content: 'Usage of en, a, de, and other frequent prepositions.',
        },
        {
          id: 'mexican-preps',
          title: 'Mexican prepositional expressions',
          content: 'Idiomatic prepositional phrases common in Mexican Spanish.',
        },
      ],
    },
    {
      id: 9,
      level: 'B1',
      category: 'Mexican Spanish Specific Features',
      title: 'Diminutives',
      spanishTitle: 'Diminutivos',
      preview: ['Formation', 'Usage', 'Emotional connotations'],
      sections: [
        {
          id: 'diminutive-formation',
          title: 'Formation of diminutives',
          content: 'Rules for forming diminutives with -ito/a, -cito/a.',
        },
        {
          id: 'diminutive-usage',
          title: 'Usage in daily speech',
          content: 'Common contexts and frequency of diminutive use in Mexican Spanish.',
        },
        {
          id: 'emotional-diminutives',
          title: 'Emotional connotations',
          content: 'Understanding the affective meanings of diminutives.',
        },
      ],
    },
    {
      id: 10,
      level: 'B1',
      category: 'Mexican Spanish Specific Features',
      title: 'Informal Commands',
      spanishTitle: 'Comandos informales',
      preview: ['Tú commands', 'Command intensifiers', 'Common expressions'],
      sections: [
        {
          id: 'tu-commands',
          title: 'Tú commands',
          content: 'Formation and use of informal commands.',
        },
        {
          id: 'command-intensifiers',
          title: 'Command intensifiers',
          content: 'Using le and les to intensify commands in Mexican Spanish.',
        },
        {
          id: 'command-expressions',
          title: 'Common command expressions',
          content: 'Frequently used informal commands in daily situations.',
        },
      ],
    },
    {
      id: 11,
      level: 'B1',
      category: 'Pronouns and Prepositions',
      title: 'Leísmo in Mexican Spanish',
      spanishTitle: 'El leísmo en español mexicano',
      preview: ['Understanding leísmo', 'Regional variations', 'Common usage patterns'],
      sections: [
        {
          id: 'leismo-basics',
          title: 'Understanding leísmo',
          content: 'The use of "le" instead of "lo/la" as direct object pronouns in Mexican Spanish, particularly with people as objects.',
        },
        {
          id: 'regional-differences',
          title: 'Regional variations',
          content: 'How leísmo differs between Mexican Spanish and other Spanish-speaking regions.',
        },
        {
          id: 'common-patterns',
          title: 'Common usage patterns',
          content: 'Typical situations where leísmo occurs in Mexican Spanish and when to avoid it.',
        },
      ],
    },
    {
      id: 12,
      level: 'B1',
      category: 'Pronouns and Prepositions',
      title: 'When "le" changes to "se"',
      spanishTitle: 'Cuando "le" cambia a "se"',
      preview: ['Le to se rule', 'Common combinations', 'Usage examples'],
      sections: [
        {
          id: 'le-se-rule',
          title: 'The le to se rule',
          content: 'Understanding when and why "le" changes to "se" when combined with direct object pronouns.',
        },
        {
          id: 'common-combinations',
          title: 'Common combinations',
          content: 'Frequent combinations of "se" with other pronouns and their meanings.',
        },
        {
          id: 'practical-examples',
          title: 'Practical examples',
          content: 'Real-world examples of the le-to-se transformation in everyday Mexican Spanish.',
        },
      ],
    },
    {
      id: 13,
      level: 'B1',
      category: 'Pronouns and Prepositions',
      title: 'Reflexive Pronoun Usage',
      spanishTitle: 'Uso de pronombres reflexivos',
      preview: ['Basic reflexives', 'Idiomatic expressions', 'Emotional reflexives'],
      sections: [
        {
          id: 'basic-reflexives',
          title: 'Basic reflexive usage',
          content: 'Understanding when and how to use reflexive pronouns for actions done to oneself.',
        },
        {
          id: 'idiomatic-reflexives',
          title: 'Idiomatic expressions',
          content: 'Common Mexican Spanish expressions that use reflexive pronouns in unexpected ways.',
        },
        {
          id: 'emotional-reflexives',
          title: 'Emotional reflexives',
          content: 'Using reflexive pronouns to express emotional involvement or personal interest.',
        },
      ],
    },
    {
      id: 14,
      level: 'B1',
      category: 'Pronouns and Prepositions',
      title: 'Pronouns with Compound Verb Tenses',
      spanishTitle: 'Pronombres con tiempos verbales compuestos',
      preview: ['Placement rules', 'Common combinations', 'Regional preferences'],
      sections: [
        {
          id: 'placement-rules',
          title: 'Pronoun placement rules',
          content: 'Understanding where to place pronouns with compound tenses like present perfect and progressive forms.',
        },
        {
          id: 'compound-combinations',
          title: 'Common combinations',
          content: 'Frequently used combinations of pronouns with auxiliary verbs in compound tenses.',
        },
        {
          id: 'mexican-preferences',
          title: 'Mexican Spanish preferences',
          content: 'How Mexican Spanish speakers typically handle pronoun placement in compound tenses, including regional variations.',
        },
      ],
    },
    // B2 Topics
    {
      id: 15,
      level: 'B2',
      category: 'Verb Tenses',
      title: 'Preterite vs. Imperfect',
      spanishTitle: 'Pretérito vs. Imperfecto',
      preview: ['Storytelling techniques', 'Temporal relationships', 'Narrative flow'],
      sections: [
        {
          id: 'storytelling',
          title: 'Storytelling Techniques',
          content: 'Advanced usage of preterite and imperfect in narrative contexts, focusing on how to create dynamic and engaging stories.',
        },
        {
          id: 'temporal',
          title: 'Temporal Relationships',
          content: 'Understanding how preterite and imperfect interact to establish time relationships in complex narratives.',
        },
        {
          id: 'narrative',
          title: 'Narrative Flow',
          content: 'Using both tenses to create smooth transitions and maintain narrative coherence in extended discourse.',
        },
      ],
    },
    {
      id: 16,
      level: 'B2',
      category: 'Verb Tenses',
      title: 'Present Perfect vs. Preterite',
      spanishTitle: 'Pretérito Perfecto vs. Pretérito Simple',
      preview: ['Regional variations', 'Mexican usage', 'Spain comparisons'],
      sections: [
        {
          id: 'regional',
          title: 'Regional Variations',
          content: 'Understanding how present perfect usage varies between Mexico and Spain, with focus on Mexican preferences.',
        },
        {
          id: 'mexican-usage',
          title: 'Mexican Usage Patterns',
          content: 'Specific contexts where Mexican Spanish prefers preterite over present perfect.',
        },
        {
          id: 'comparison',
          title: 'Comparative Analysis',
          content: 'Detailed comparison of usage patterns between Mexican and Peninsular Spanish.',
        },
      ],
    },
    {
      id: 17,
      level: 'B2',
      category: 'Verb Tenses',
      title: 'Past Perfect (Pluperfect)',
      spanishTitle: 'Pretérito Pluscuamperfecto',
      preview: ['Previous actions', 'Time sequences', 'Complex narratives'],
      sections: [
        {
          id: 'formation',
          title: 'Formation and Basic Usage',
          content: 'Understanding how to form and use the pluperfect to express actions completed before another past action.',
        },
        {
          id: 'sequences',
          title: 'Time Sequences',
          content: 'Creating complex time sequences using pluperfect in combination with other past tenses.',
        },
        {
          id: 'narratives',
          title: 'Complex Narratives',
          content: 'Using pluperfect in sophisticated storytelling and formal writing.',
        },
      ],
    },
    {
      id: 18,
      level: 'B2',
      category: 'Verb Tenses',
      title: 'Future Tenses',
      spanishTitle: 'Tiempos Futuros',
      preview: ['Simple vs Perfect', 'Certainty levels', 'Predictions'],
      sections: [
        {
          id: 'comparison',
          title: 'Simple vs Perfect Future',
          content: 'Comparing and contrasting the use of simple future and future perfect for different types of predictions.',
        },
        {
          id: 'certainty',
          title: 'Expressing Certainty',
          content: 'Using different future forms to express varying degrees of certainty about future events.',
        },
        {
          id: 'predictions',
          title: 'Making Predictions',
          content: 'Advanced techniques for making predictions and expressing probability about future events.',
        },
      ],
    },
    {
      id: 19,
      level: 'B2',
      category: 'Conditional Sentences',
      title: 'Types of Conditionals',
      spanishTitle: 'Tipos de Condicionales',
      preview: ['Real conditions', 'Hypothetical situations', 'Mixed conditionals'],
      sections: [
        {
          id: 'real',
          title: 'Real Conditions',
          content: 'First conditional structures for expressing real possibilities in the present or future.',
        },
        {
          id: 'hypothetical',
          title: 'Hypothetical Situations',
          content: 'Second and third conditional structures for expressing unlikely or impossible situations.',
        },
        {
          id: 'mixed',
          title: 'Mixed Conditionals',
          content: 'Combining different types of conditionals for complex hypothetical expressions.',
        },
      ],
    },
    {
      id: 20,
      level: 'B2',
      category: 'Subjunctive Mood',
      title: 'Advanced Subjunctive Usage',
      spanishTitle: 'Uso Avanzado del Subjuntivo',
      preview: ['Complex structures', 'Time correlations', 'Advanced triggers'],
      sections: [
        {
          id: 'structures',
          title: 'Complex Structures',
          content: 'Advanced subjunctive structures including imperfect and pluperfect subjunctive.',
        },
        {
          id: 'correlations',
          title: 'Time Correlations',
          content: 'Understanding the relationship between tenses in main and subordinate clauses.',
        },
        {
          id: 'triggers',
          title: 'Advanced Triggers',
          content: 'Complex expressions and situations that trigger subjunctive usage.',
        },
      ],
    },
    {
      id: 21,
      level: 'B2',
      category: 'Passive Voice',
      title: 'Passive Constructions',
      spanishTitle: 'Construcciones Pasivas',
      preview: ['Ser vs Se passive', 'Impersonal se', 'Usage contexts'],
      sections: [
        {
          id: 'types',
          title: 'Types of Passive Voice',
          content: 'Different ways to express passive voice in Spanish, including ser + participle and se passive.',
        },
        {
          id: 'impersonal',
          title: 'Impersonal Constructions',
          content: 'Using se for impersonal expressions and general statements.',
        },
        {
          id: 'contexts',
          title: 'Contextual Usage',
          content: 'When and how to use different passive constructions in various contexts.',
        },
      ],
    },
    {
      id: 22,
      level: 'B2',
      category: 'Mexican Spanish Features',
      title: 'Advanced Mexican Usage',
      spanishTitle: 'Español Mexicano Avanzado',
      preview: ['Regional variations', 'Colloquial expressions', 'Cultural context'],
      sections: [
        {
          id: 'variations',
          title: 'Regional Variations',
          content: 'Advanced features specific to Mexican Spanish, including verb usage and vocabulary.',
        },
        {
          id: 'expressions',
          title: 'Colloquial Expressions',
          content: 'Sophisticated colloquial expressions and their cultural context.',
        },
        {
          id: 'culture',
          title: 'Cultural Context',
          content: 'Understanding how cultural factors influence language use in Mexico.',
        },
      ],
    },
  ],
  
  getTopicsByLevel: (level: CEFRLevel) => {
    const topics = get().topics.filter(topic => topic.level === level);
    const categories = new Map<string, Topic[]>();
    
    topics.forEach(topic => {
      if (!categories.has(topic.category)) {
        categories.set(topic.category, []);
      }
      categories.get(topic.category)?.push(topic);
    });
    
    return Array.from(categories.entries()).map(([name, topics]) => ({
      name,
      topics,
    }));
  },
}));