interface TensePromptTemplate {
  tense: string;
  instructions: string;
  timeMarkers: string[];
  examples: Array<{
    spanish: string;
    english: string;
    verb: string;
    correctForm: string;
    subject: string;
  }>;
}

export const TENSE_PROMPTS: Record<string, TensePromptTemplate> = {
  'Present Simple': {
    tense: 'Present Simple (Presente Simple)',
    instructions: `Generate sentences using ONLY the Present Simple tense. This tense describes:
- Current actions happening now
- Habitual actions (todos los días, siempre, nunca)
- General truths and facts
- Scheduled future events

Use time markers like: ahora, hoy, todos los días, siempre, generalmente, cada día, normalmente.`,
    timeMarkers: ['ahora', 'hoy', 'todos los días', 'siempre', 'generalmente', 'cada día', 'normalmente'],
    examples: [
      {
        spanish: '¿_____ (comer) tú frutas todos los días?',
        english: 'Do you eat fruits every day?',
        verb: 'comer',
        correctForm: 'comes',
        subject: 'tú'
      },
      {
        spanish: 'Yo _____ (trabajar) en una oficina ahora.',
        english: 'I work in an office now.',
        verb: 'trabajar',
        correctForm: 'trabajo',
        subject: 'yo'
      }
    ]
  },

  'Preterite': {
    tense: 'Preterite (Pretérito Indefinido)',
    instructions: `Generate sentences using ONLY the Preterite tense. This tense describes:
- Completed actions in the past (finished at a specific time)
- Actions that happened at a specific moment
- Sequential actions in the past

Use time markers like: ayer, anoche, la semana pasada, el año pasado, hace dos días, en 2020, el lunes pasado.
DO NOT use imperfect tense markers like "siempre", "todos los días", "mientras", "cuando era".`,
    timeMarkers: ['ayer', 'anoche', 'la semana pasada', 'el año pasado', 'hace dos días', 'en 2020', 'el mes pasado'],
    examples: [
      {
        spanish: '¿_____ (ir) ustedes al cine ayer?',
        english: 'Did you go to the cinema yesterday?',
        verb: 'ir',
        correctForm: 'fueron',
        subject: 'ustedes'
      },
      {
        spanish: 'Ella _____ (comprar) un libro la semana pasada.',
        english: 'She bought a book last week.',
        verb: 'comprar',
        correctForm: 'compró',
        subject: 'ella'
      }
    ]
  },

  'Imperfect': {
    tense: 'Imperfect (Pretérito Imperfecto)',
    instructions: `Generate sentences using ONLY the Imperfect tense. This tense describes:
- Habitual or repeated actions in the past (used to do, would do)
- Ongoing actions in the past without a defined end
- Descriptions of people, things, or situations in the past
- Background context in narratives
- Ages in the past (tenía X años)
- Time in the past (era la una, eran las dos)

Use time markers like: cuando era niño/a, siempre, todos los días, frecuentemente, antes, de pequeño/a, en aquellos tiempos, mientras.
DO NOT use preterite markers like "ayer", "la semana pasada", "de repente".

CRITICAL: All verbs MUST be conjugated in the imperfect tense (-aba, -ía endings for regular verbs, or irregular forms like era, iba, veía).`,
    timeMarkers: ['cuando era niño/a', 'siempre', 'todos los días', 'frecuentemente', 'antes', 'de pequeño/a', 'mientras', 'en aquellos tiempos'],
    examples: [
      {
        spanish: 'Cuando era joven, yo _____ (jugar) fútbol todos los días.',
        english: 'When I was young, I used to play soccer every day.',
        verb: 'jugar',
        correctForm: 'jugaba',
        subject: 'yo'
      },
      {
        spanish: 'Ellos siempre _____ (comer) juntos antes.',
        english: 'They always used to eat together before.',
        verb: 'comer',
        correctForm: 'comían',
        subject: 'ellos'
      },
      {
        spanish: 'Mi abuela _____ (vivir) en el campo cuando era niña.',
        english: 'My grandmother used to live in the countryside when she was a child.',
        verb: 'vivir',
        correctForm: 'vivía',
        subject: 'mi abuela (ella)'
      }
    ]
  },

  'Present Perfect': {
    tense: 'Present Perfect (Pretérito Perfecto)',
    instructions: `Generate sentences using ONLY the Present Perfect tense. This tense describes:
- Recent actions that have just happened
- Past experiences relevant to the present
- Actions that started in the past and continue to the present

Structure: haber (he, has, ha, hemos, han) + past participle (-ado, -ido)
Use time markers like: hoy, esta semana, este mes, este año, ya, todavía no, nunca, alguna vez, recientemente.
DO NOT confuse with simple past (preterite).`,
    timeMarkers: ['hoy', 'esta semana', 'este mes', 'este año', 'ya', 'todavía no', 'nunca', 'alguna vez', 'recientemente'],
    examples: [
      {
        spanish: '¿_____ (ver) tú esta película alguna vez?',
        english: 'Have you ever seen this movie?',
        verb: 'ver',
        correctForm: 'has visto',
        subject: 'tú'
      },
      {
        spanish: 'Nosotros _____ (terminar) el proyecto esta semana.',
        english: 'We have finished the project this week.',
        verb: 'terminar',
        correctForm: 'hemos terminado',
        subject: 'nosotros'
      }
    ]
  },

  'Past Perfect': {
    tense: 'Past Perfect (Pretérito Pluscuamperfecto)',
    instructions: `Generate sentences using ONLY the Past Perfect tense. This tense describes:
- Actions that happened before another past action
- Past actions completed before a specific time in the past

Structure: haber (había, habías, había, habíamos, habían) + past participle (-ado, -ido)
Use time markers like: ya, todavía no, antes de, cuando llegué, después de que.`,
    timeMarkers: ['ya', 'todavía no', 'antes de', 'cuando llegué', 'después de que'],
    examples: [
      {
        spanish: 'Cuando llegamos, ellos ya _____ (salir).',
        english: 'When we arrived, they had already left.',
        verb: 'salir',
        correctForm: 'habían salido',
        subject: 'ellos'
      },
      {
        spanish: 'Yo nunca _____ (estudiar) español antes de mudarme a España.',
        english: 'I had never studied Spanish before moving to Spain.',
        verb: 'estudiar',
        correctForm: 'había estudiado',
        subject: 'yo'
      }
    ]
  },

  'Present Subjunctive': {
    tense: 'Present Subjunctive (Presente de Subjuntivo)',
    instructions: `Generate sentences using ONLY the Present Subjunctive tense. This tense describes:
- Wishes, desires, hopes (espero que, quiero que, ojalá)
- Doubts and uncertainties (dudo que, no creo que)
- Emotions (me alegra que, me preocupa que)
- Recommendations and suggestions (es importante que, recomiendo que)

Use triggers like: que, espero que, quiero que, es necesario que, dudo que, ojalá, aunque, para que.`,
    timeMarkers: ['espero que', 'quiero que', 'es necesario que', 'dudo que', 'ojalá', 'aunque', 'para que', 'es importante que'],
    examples: [
      {
        spanish: 'Espero que tú _____ (venir) a la fiesta.',
        english: 'I hope that you come to the party.',
        verb: 'venir',
        correctForm: 'vengas',
        subject: 'tú'
      },
      {
        spanish: 'Es importante que nosotros _____ (estudiar) para el examen.',
        english: 'It\'s important that we study for the exam.',
        verb: 'estudiar',
        correctForm: 'estudiemos',
        subject: 'nosotros'
      }
    ]
  },

  'Past Subjunctive': {
    tense: 'Past Subjunctive (Pretérito Imperfecto de Subjuntivo)',
    instructions: `Generate sentences using ONLY the Past Subjunctive tense. This tense describes:
- Hypothetical situations in the past
- Wishes about the past
- Used after "si" in conditional sentences

Structure: -ara/-iera endings (or -ase/-iese)
Use with: si, ojalá, como si, quisiera que, dudaba que.`,
    timeMarkers: ['si', 'ojalá', 'como si', 'quisiera que', 'dudaba que'],
    examples: [
      {
        spanish: 'Si yo _____ (tener) más tiempo, viajaría más.',
        english: 'If I had more time, I would travel more.',
        verb: 'tener',
        correctForm: 'tuviera',
        subject: 'yo'
      },
      {
        spanish: 'Ojalá tú _____ (poder) venir ayer.',
        english: 'I wish you could have come yesterday.',
        verb: 'poder',
        correctForm: 'pudieras',
        subject: 'tú'
      }
    ]
  },

  'Future Perfect': {
    tense: 'Future Perfect (Futuro Perfecto)',
    instructions: `Generate sentences using ONLY the Future Perfect tense. This tense describes:
- Actions that will be completed before a specific time in the future
- Speculations about past actions

Structure: haber (habré, habrás, habrá, habremos, habrán) + past participle
Use time markers like: para entonces, para el año que viene, antes de que, cuando llegues.`,
    timeMarkers: ['para entonces', 'para el año que viene', 'antes de que', 'cuando llegues', 'en dos años'],
    examples: [
      {
        spanish: 'Para mañana, yo _____ (terminar) el informe.',
        english: 'By tomorrow, I will have finished the report.',
        verb: 'terminar',
        correctForm: 'habré terminado',
        subject: 'yo'
      },
      {
        spanish: 'Cuando llegues, nosotros ya _____ (comer).',
        english: 'When you arrive, we will have already eaten.',
        verb: 'comer',
        correctForm: 'habremos comido',
        subject: 'nosotros'
      }
    ]
  },

  'Future Simple': {
    tense: 'Future Simple (Futuro Simple)',
    instructions: `Generate sentences using ONLY the Future Simple tense. This tense describes:
- Actions that will happen in the future
- Predictions and suppositions
- Promises and intentions

Structure: infinitive + endings (-é, -ás, -á, -emos, -án)
Use time markers like: mañana, la próxima semana, el año que viene, pronto, en el futuro, más tarde.`,
    timeMarkers: ['mañana', 'la próxima semana', 'el año que viene', 'pronto', 'en el futuro', 'más tarde'],
    examples: [
      {
        spanish: '¿_____ (viajar) tú a España el próximo verano?',
        english: 'Will you travel to Spain next summer?',
        verb: 'viajar',
        correctForm: 'viajarás',
        subject: 'tú'
      },
      {
        spanish: 'Nosotros _____ (estudiar) mucho para el examen mañana.',
        english: 'We will study a lot for the exam tomorrow.',
        verb: 'estudiar',
        correctForm: 'estudiaremos',
        subject: 'nosotros'
      }
    ]
  },

  'Conditional': {
    tense: 'Conditional (Condicional Simple)',
    instructions: `Generate sentences using ONLY the Conditional tense. This tense describes:
- Hypothetical situations
- Polite requests
- Future from a past perspective
- Wishes and desires

Structure: infinitive + endings (-ía, -ías, -ía, -íamos, -ían)
Use with: si + imperfect subjunctive, me gustaría, deberías, podrías, quisiera.`,
    timeMarkers: ['si tuviera', 'me gustaría', 'deberías', 'podría', 'en tu lugar'],
    examples: [
      {
        spanish: 'Si tuviera dinero, yo _____ (viajar) por el mundo.',
        english: 'If I had money, I would travel around the world.',
        verb: 'viajar',
        correctForm: 'viajaría',
        subject: 'yo'
      },
      {
        spanish: '¿_____ (poder) tú ayudarme con esto?',
        english: 'Could you help me with this?',
        verb: 'poder',
        correctForm: 'podrías',
        subject: 'tú'
      }
    ]
  },

  'All Previous Tenses': {
    tense: 'All Previous Tenses',
    instructions: `Generate sentences using a MIX of advanced tenses including:
- Present Perfect
- Past Perfect
- Present Subjunctive
- Imperfect
- Preterite
- Future

Use a variety of time markers and contexts appropriate for advanced learners.`,
    timeMarkers: ['varies by tense'],
    examples: [
      {
        spanish: 'Si hubieras llegado antes, _____ (ver) el espectáculo.',
        english: 'If you had arrived earlier, you would have seen the show.',
        verb: 'ver',
        correctForm: 'habrías visto',
        subject: 'tú'
      }
    ]
  },

  'All Tenses': {
    tense: 'All Tenses',
    instructions: `Generate sentences using ANY appropriate tense for C2 level mastery practice. Include:
- Complex subjunctive moods
- Perfect tenses
- Conditional perfect
- Advanced time relationships

Use sophisticated vocabulary and complex sentence structures.`,
    timeMarkers: ['varies by context'],
    examples: [
      {
        spanish: 'Me sorprende que no _____ (haber) llegado todavía.',
        english: 'It surprises me that they haven\'t arrived yet.',
        verb: 'haber',
        correctForm: 'hayan',
        subject: 'ellos'
      }
    ]
  }
};

export function getTensePrompt(tenseName: string, level: string): string {
  const template = TENSE_PROMPTS[tenseName];

  if (!template) {
    return `Generate 5 Spanish sentences for conjugation practice at ${level} level using the ${tenseName} tense.`;
  }

  const exampleText = template.examples.map(ex =>
    `Example:\n- Spanish: "${ex.spanish}"\n- English: "${ex.english}"\n- Correct form: ${ex.correctForm} (${ex.subject})`
  ).join('\n\n');

  return `You are creating Spanish verb conjugation practice exercises. Generate EXACTLY 5 sentences.

**CRITICAL TENSE REQUIREMENT:**
You MUST generate sentences using ONLY the ${template.tense}. DO NOT mix tenses. Every verb conjugation MUST be in this specific tense.

**${template.tense} Usage:**
${template.instructions}

**Required Time Markers (use these in your sentences):**
${template.timeMarkers.join(', ')}

**Examples of Correct ${template.tense} Sentences:**
${exampleText}

**Instructions:**
- Create 5 sentences at ${level} CEFR level
- Each sentence MUST use the ${template.tense} for the blank verb
- Leave a blank space _____ where the conjugated verb should go
- Include the infinitive form in parentheses after the blank: _____ (infinitive)
- Use different subjects: yo, tú, él/ella/usted, nosotros/nosotras, ellos/ellas/ustedes
- Mix statements, questions, and negatives
- Include appropriate time markers that require ${template.tense}
- Provide clear context clues that naturally require this specific tense
- Include proper IPA (International Phonetic Alphabet) transcription for the complete sentence
- Use standard IPA symbols in brackets [like this]

**IPA Guidelines:**
- Use [b] [d] [g] for stops, [β] [ð] [ɣ] for fricatives
- Use [ɾ] for tap r, [r] for trill rr
- Use [ʎ] for ll, [ɲ] for ñ
- Use [x] for j/g (before e,i)
- Use [θ] for c/z (Castilian) or [s] (Latin American)
- Mark stress with ˈ before stressed syllable
- Enclose entire transcription in square brackets [...]

**Required JSON Format:**
Return ONLY a JSON array with exactly 5 objects in this format:
[
  {
    "spanish": "Cuando era pequeña, yo _____ (jugar) en el parque todos los días.",
    "english": "When I was little, I used to play in the park every day.",
    "ipa": "[ˈkwando ˈeɾa peˈkeɲa ʝo xuˈɣaβa en el ˈpaɾke ˈtoðos los ˈdi.as]",
    "verb": {
      "infinitive": "jugar",
      "correctForm": "jugaba",
      "subject": "yo",
      "tense": "${template.tense}"
    },
    "context": "Habitual action in the past using imperfect tense with time marker 'todos los días'"
  }
]

VALIDATION: Before returning, verify that:
1. All 5 sentences use ONLY ${template.tense}
2. Each sentence includes appropriate time markers
3. The "correctForm" field contains the verb conjugated in ${template.tense}
4. The "tense" field is set to "${template.tense}"

Return ONLY the JSON array, no other text.`;
}
