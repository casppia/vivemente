interface IPAMapping {
  [key: string]: string;
}

const mexicanSpanishIPA: IPAMapping = {
  'a': 'a',
  'e': 'e',
  'i': 'i',
  'o': 'o',
  'u': 'u',
  'á': 'a',
  'é': 'e',
  'í': 'i',
  'ó': 'o',
  'ú': 'u',
  'b': 'b',
  'c': 'k',
  'd': 'd',
  'f': 'f',
  'g': 'ɡ',
  'h': '',
  'j': 'x',
  'k': 'k',
  'l': 'l',
  'm': 'm',
  'n': 'n',
  'ñ': 'ɲ',
  'p': 'p',
  'q': 'k',
  'r': 'ɾ',
  'rr': 'r',
  's': 's',
  't': 't',
  'v': 'b',
  'w': 'w',
  'x': 'ks',
  'y': 'ʝ',
  'z': 's',
  'll': 'ʝ',
  'ch': 'tʃ',
  'gu': 'ɡ',
  'qu': 'k',
};

function hasWrittenAccent(word: string): boolean {
  return /[áéíóú]/i.test(word);
}

function endsInVowelNS(word: string): boolean {
  return /[aeiouáéíóú]$|[ns]$/i.test(word);
}

export function textToIPA(text: string): string {
  const words = text.toLowerCase().split(/\s+/);

  return words.map(word => {
    if (!word || /[^a-záéíóúñüA-ZÁÉÍÓÚÑÜ]/.test(word.replace(/[¿?¡!,.;:]/g, ''))) {
      return word;
    }

    const cleanWord = word.replace(/[¿?¡!,.;:]/g, '');
    let ipa = '';
    let i = 0;

    while (i < cleanWord.length) {
      const char = cleanWord[i];
      const nextChar = cleanWord[i + 1] || '';
      const twoChar = char + nextChar;

      if (mexicanSpanishIPA[twoChar]) {
        ipa += mexicanSpanishIPA[twoChar];
        i += 2;
      } else if (char === 'c') {
        if (nextChar === 'e' || nextChar === 'i') {
          ipa += 's';
        } else if (nextChar === 'h') {
          ipa += 'tʃ';
          i++;
        } else {
          ipa += 'k';
        }
        i++;
      } else if (char === 'g') {
        if (nextChar === 'e' || nextChar === 'i') {
          ipa += 'x';
        } else if (nextChar === 'u' && (cleanWord[i + 2] === 'e' || cleanWord[i + 2] === 'i')) {
          ipa += 'ɡ';
          i += 2;
        } else {
          ipa += 'ɡ';
        }
        i++;
      } else if (char === 'q' && nextChar === 'u') {
        ipa += 'k';
        i += 2;
      } else if (char === 'r') {
        if (i === 0 || cleanWord[i - 1] === 'n' || cleanWord[i - 1] === 'l' || cleanWord[i - 1] === 's') {
          ipa += 'r';
        } else if (nextChar === 'r') {
          ipa += 'r';
          i++;
        } else {
          ipa += 'ɾ';
        }
        i++;
      } else if (mexicanSpanishIPA[char]) {
        ipa += mexicanSpanishIPA[char];
        i++;
      } else {
        ipa += char;
        i++;
      }
    }

    if (hasWrittenAccent(cleanWord)) {
      let vowelCount = 0;
      const accentIndex = cleanWord.search(/[áéíóú]/i);

      for (let j = 0; j <= accentIndex; j++) {
        if (/[aeiouáéíóú]/i.test(cleanWord[j])) {
          vowelCount++;
        }
      }

      const vowelPattern = /[aeiou]/g;
      const vowels = [...ipa.matchAll(vowelPattern)];

      if (vowels[vowelCount - 1]) {
        const vowelIndex = vowels[vowelCount - 1].index!;
        ipa = ipa.substring(0, vowelIndex) + '·' + ipa.substring(vowelIndex);
      }
    } else {
      const vowelPattern = /[aeiou]/g;
      const vowels = [...ipa.matchAll(vowelPattern)];
      const syllableCount = vowels.length;

      if (syllableCount > 1) {
        let stressPosition;
        if (endsInVowelNS(cleanWord)) {
          stressPosition = Math.max(0, syllableCount - 2);
        } else {
          stressPosition = syllableCount - 1;
        }

        if (vowels[stressPosition]) {
          const vowelIndex = vowels[stressPosition].index!;
          ipa = ipa.substring(0, vowelIndex) + '·' + ipa.substring(vowelIndex);
        }
      }
    }

    const punctuation = word.match(/[¿?¡!,.;:]+$/);
    return '/' + ipa + '/' + (punctuation ? punctuation[0] : '');
  }).join(' ');
}

export function wordToIPA(word: string): string {
  return textToIPA(word);
}
