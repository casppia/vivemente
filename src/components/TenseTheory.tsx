import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ConjugationTableProps {
  verbs: {
    infinitive: string;
    conjugations: {
      yo: string;
      tu: string;
      el: string;
      nosotros: string;
      vosotros: string;
      ellos: string;
    };
  }[];
}

function ConjugationTable({ verbs }: ConjugationTableProps) {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">Person</th>
            {verbs.map(verb => (
              <th key={verb.infinitive} className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">
                {verb.infinitive}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(verbs[0].conjugations).map(person => (
            <tr key={person} className="border-t border-gray-200 dark:border-gray-700">
              <td className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">
                {person}
              </td>
              {verbs.map(verb => (
                <td key={`${verb.infinitive}-${person}`} className="px-4 py-2 text-gray-600 dark:text-gray-400">
                  {verb.conjugations[person as keyof typeof verb.conjugations]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TenseTheoryProps {
  tense: string;
  explanations: string[];
  verbs: ConjugationTableProps['verbs'];
}

function TenseSection({ tense, explanations, verbs }: TenseTheoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {tense}
        </h3>
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ height: 'auto' }}
          animate={{ height: 'auto' }}
          className="px-6 pb-6"
        >
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  When to use:
                </h4>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {isExpanded ? 'Hide details' : 'Show details'}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
              <ul className="space-y-2">
                {explanations.map((explanation, index) => (
                  <li key={index} className="text-gray-600 dark:text-gray-400 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{explanation}</span>
                  </li>
                ))}
              </ul>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Conjugation Examples:
                    </h4>
                    <ConjugationTable verbs={verbs} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function TenseTheory() {
  return (
    <div className="space-y-4">
      <TenseSection
        tense="Present Simple"
        explanations={[
          "Express habitual or repeated actions",
          "State general truths or facts"
        ]}
        verbs={[
          {
            infinitive: "hablar",
            conjugations: {
              yo: "hablo",
              tu: "hablas",
              el: "habla",
              nosotros: "hablamos",
              vosotros: "habláis",
              ellos: "hablan"
            }
          },
          {
            infinitive: "comer",
            conjugations: {
              yo: "como",
              tu: "comes",
              el: "come",
              nosotros: "comemos",
              vosotros: "coméis",
              ellos: "comen"
            }
          },
          {
            infinitive: "vivir",
            conjugations: {
              yo: "vivo",
              tu: "vives",
              el: "vive",
              nosotros: "vivimos",
              vosotros: "vivís",
              ellos: "viven"
            }
          }
        ]}
      />

      <TenseSection
        tense="Preterite"
        explanations={[
          "Express completed actions in the past",
          "Describe specific events with a clear beginning and end"
        ]}
        verbs={[
          {
            infinitive: "hablar",
            conjugations: {
              yo: "hablé",
              tu: "hablaste",
              el: "habló",
              nosotros: "hablamos",
              vosotros: "hablasteis",
              ellos: "hablaron"
            }
          },
          {
            infinitive: "comer",
            conjugations: {
              yo: "comí",
              tu: "comiste",
              el: "comió",
              nosotros: "comimos",
              vosotros: "comisteis",
              ellos: "comieron"
            }
          },
          {
            infinitive: "vivir",
            conjugations: {
              yo: "viví",
              tu: "viviste",
              el: "vivió",
              nosotros: "vivimos",
              vosotros: "vivisteis",
              ellos: "vivieron"
            }
          }
        ]}
      />

      <TenseSection
        tense="Imperfect"
        explanations={[
          "Describe ongoing or repeated actions in the past",
          "Set the scene or provide background information"
        ]}
        verbs={[
          {
            infinitive: "hablar",
            conjugations: {
              yo: "hablaba",
              tu: "hablabas",
              el: "hablaba",
              nosotros: "hablábamos",
              vosotros: "hablabais",
              ellos: "hablaban"
            }
          },
          {
            infinitive: "comer",
            conjugations: {
              yo: "comía",
              tu: "comías",
              el: "comía",
              nosotros: "comíamos",
              vosotros: "comíais",
              ellos: "comían"
            }
          },
          {
            infinitive: "vivir",
            conjugations: {
              yo: "vivía",
              tu: "vivías",
              el: "vivía",
              nosotros: "vivíamos",
              vosotros: "vivíais",
              ellos: "vivían"
            }
          }
        ]}
      />

      <TenseSection
        tense="Present Perfect"
        explanations={[
          "Express actions completed in the recent past",
          "Describe experiences that continue to be relevant"
        ]}
        verbs={[
          {
            infinitive: "hablar",
            conjugations: {
              yo: "he hablado",
              tu: "has hablado",
              el: "ha hablado",
              nosotros: "hemos hablado",
              vosotros: "habéis hablado",
              ellos: "han hablado"
            }
          },
          {
            infinitive: "comer",
            conjugations: {
              yo: "he comido",
              tu: "has comido",
              el: "ha comido",
              nosotros: "hemos comido",
              vosotros: "habéis comido",
              ellos: "han comido"
            }
          },
          {
            infinitive: "vivir",
            conjugations: {
              yo: "he vivido",
              tu: "has vivido",
              el: "ha vivido",
              nosotros: "hemos vivido",
              vosotros: "habéis vivido",
              ellos: "han vivido"
            }
          }
        ]}
      />
    </div>
  );
}

export { TenseTheory }