import { CEFRLevel } from './level';

export interface TenseExample {
  infinitive: string;
  conjugation: {
    yo: string;
    tu: string;
    el: string;
    nosotros: string;
    vosotros: string;
    ellos: string;
  };
}

export interface TenseDescription {
  name: string;
  level: CEFRLevel;
  formation: string;
  example: TenseExample;
  usage: string[];
  timeMarkers: string[];
}

export const TENSE_DESCRIPTIONS: TenseDescription[] = [
  {
    name: 'Present Simple',
    level: 'A1',
    formation: 'Remove -ar/-er/-ir and add appropriate endings (-o, -as, -a, -amos, -áis, -an)',
    example: {
      infinitive: 'caminar',
      conjugation: {
        yo: 'camino',
        tu: 'caminas',
        el: 'camina',
        nosotros: 'caminamos',
        vosotros: 'camináis',
        ellos: 'caminan'
      }
    },
    usage: [
      'Express habitual actions',
      'State general truths',
      'Talk about schedules',
      'Describe current situations'
    ],
    timeMarkers: [
      'todos los días',
      'siempre',
      'normalmente',
      'generalmente',
      'ahora'
    ]
  },
  {
    name: 'Present Progressive',
    level: 'A2',
    formation: 'estar (conjugated in present) + gerund (-ando for -ar verbs, -iendo for -er/-ir verbs)',
    example: {
      infinitive: 'caminar',
      conjugation: {
        yo: 'estoy caminando',
        tu: 'estás caminando',
        el: 'está caminando',
        nosotros: 'estamos caminando',
        vosotros: 'estáis caminando',
        ellos: 'están caminando'
      }
    },
    usage: [
      'Actions happening right now',
      'Temporary actions',
      'Changing or developing situations',
      'Future arrangements'
    ],
    timeMarkers: [
      'ahora',
      'en este momento',
      'actualmente',
      'hoy'
    ]
  },
  {
    name: 'Present Perfect',
    level: 'B1',
    formation: 'haber (conjugated in present) + past participle (-ado for -ar verbs, -ido for -er/-ir verbs)',
    example: {
      infinitive: 'caminar',
      conjugation: {
        yo: 'he caminado',
        tu: 'has caminado',
        el: 'ha caminado',
        nosotros: 'hemos caminado',
        vosotros: 'habéis caminado',
        ellos: 'han caminado'
      }
    },
    usage: [
      'Recent past actions',
      'Past actions with present relevance',
      'Life experiences',
      'Unfinished time periods'
    ],
    timeMarkers: [
      'hoy',
      'esta semana',
      'este mes',
      'ya',
      'todavía no',
      'nunca',
      'alguna vez'
    ]
  },
  {
    name: 'Simple Past (Preterite)',
    level: 'A2',
    formation: 'Remove -ar/-er/-ir and add preterite endings (-é, -aste, -ó, -amos, -asteis, -aron)',
    example: {
      infinitive: 'caminar',
      conjugation: {
        yo: 'caminé',
        tu: 'caminaste',
        el: 'caminó',
        nosotros: 'caminamos',
        vosotros: 'caminasteis',
        ellos: 'caminaron'
      }
    },
    usage: [
      'Completed actions in the past',
      'Single events',
      'Actions that happened at a specific time',
      'Sequential actions'
    ],
    timeMarkers: [
      'ayer',
      'anoche',
      'la semana pasada',
      'el mes pasado',
      'hace dos días',
      'en 1999'
    ]
  },
  {
    name: 'Imperfect',
    level: 'B1',
    formation: 'Remove -ar/-er/-ir and add imperfect endings (-aba, -abas, etc. for -ar verbs; -ía, -ías, etc. for -er/-ir verbs)',
    example: {
      infinitive: 'caminar',
      conjugation: {
        yo: 'caminaba',
        tu: 'caminabas',
        el: 'caminaba',
        nosotros: 'caminábamos',
        vosotros: 'caminabais',
        ellos: 'caminaban'
      }
    },
    usage: [
      'Habitual actions in the past',
      'Ongoing situations in the past',
      'Descriptions in the past',
      'Setting the scene'
    ],
    timeMarkers: [
      'todos los días',
      'siempre',
      'frecuentemente',
      'de pequeño',
      'antes',
      'mientras'
    ]
  },
  {
    name: 'Simple Future',
    level: 'B1',
    formation: 'Add future endings to the infinitive (-é, -ás, -á, -emos, -éis, -án)',
    example: {
      infinitive: 'caminar',
      conjugation: {
        yo: 'caminaré',
        tu: 'caminarás',
        el: 'caminará',
        nosotros: 'caminaremos',
        vosotros: 'caminaréis',
        ellos: 'caminarán'
      }
    },
    usage: [
      'Future predictions',
      'Future plans and intentions',
      'Promises',
      'Probability in the present'
    ],
    timeMarkers: [
      'mañana',
      'la próxima semana',
      'el año que viene',
      'dentro de',
      'en el futuro'
    ]
  }
];