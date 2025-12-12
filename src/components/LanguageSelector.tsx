import { motion } from 'framer-motion';
import { useLanguageStore, TargetLanguage } from '../store/useLanguageStore';
import { Globe2 } from 'lucide-react';

const languages: { code: TargetLanguage; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
];

export function LanguageSelector() {
  const { targetLanguage, showTranslation, setTargetLanguage, toggleTranslation } = useLanguageStore();

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value as TargetLanguage)}
          className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-white"
        >
          {languages.map((lang) => (
            <option
              key={lang.code}
              value={lang.code}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {lang.name}
            </option>
          ))}
        </select>
        <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
      </div>

      <button
        onClick={toggleTranslation}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          showTranslation
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        {showTranslation ? 'Hide Translation' : 'Show Translation'}
      </button>
    </div>
  );
}