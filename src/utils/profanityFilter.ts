const BLOCKED_WORDS = [
  'fuck', 'fuck', 'f u c k', 'f*ck', 'fck',
  'shit', 'sh1t', 'sh!t', 's h i t',
  'ass', 'a$$', 'a55',
  'asshole', 'a**hole',
  'bitch', 'b1tch', 'b!tch',
  'bastard',
  'cunt', 'c*nt',
  'dick', 'd1ck',
  'cock', 'c0ck',
  'pussy', 'puss y',
  'whore', 'wh0re',
  'slut', 'sl*t',
  'nigger', 'n1gger', 'ni**er',
  'nigga',
  'faggot', 'f*ggot',
  'retard', 'ret*rd',
  'damn', 'dammit',
  'hell',
  'wtf', 'stfu',
  'motherfucker', 'motherf*cker', 'mofo',
  'piss', 'p1ss',
  'crap',
  'joder', 'coño', 'puta', 'puto', 'hostia', 'mierda', 'cabrón', 'cabron', 'pendejo',
  'chinga', 'chingada', 'verga', 'culero', 'maricón', 'maricon',
  'hijo de puta', 'hdp',
  'culo', 'polla', 'gilipolla', 'gilipollas',
  'scheisse', 'scheiße', 'ficken', 'arschloch', 'hurensohn', 'wichser',
  'merde', 'putain', 'connard', 'salaud', 'enculé',
  'vaffanculo', 'cazzo', 'stronzo', 'fanculo',
  'blyad', 'suka', 'pizda', 'khuy', 'pidor',
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[$5]/g, 's')
    .replace(/[+]/g, 't')
    .replace(/\*/g, '')
    .replace(/\s+/g, ' ');
}

export function containsProfanity(text: string): boolean {
  const normalized = normalizeText(text);
  return BLOCKED_WORDS.some((word) => {
    const normalizedWord = normalizeText(word);
    const pattern = new RegExp(`(?:^|\\s|[^a-z])${normalizedWord.replace(/\s+/g, '\\s*')}(?:$|\\s|[^a-z])`, 'i');
    return pattern.test(` ${normalized} `);
  });
}

export const PROFANITY_ERROR_MESSAGE = "It's forbidden to use this language, please be kind";
