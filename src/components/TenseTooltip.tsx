import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { TENSE_PROMPTS } from '../utils/tensePrompts';

interface TenseTooltipProps {
  tenseName: string;
  description: string;
}

export function TenseTooltip({ tenseName, description }: TenseTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileTooltip, setShowMobileTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tenseInfo = TENSE_PROMPTS[tenseName];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile) {
      clearTimeout(timeoutRef.current);
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 200);
    }
  };

  const handleClick = () => {
    if (isMobile) {
      setShowMobileTooltip(!showMobileTooltip);
    }
  };

  const showTooltip = isMobile ? showMobileTooltip : isHovered;

  return (
    <div className="relative inline-block">
      <div
        className="flex items-center gap-2 cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {tenseName}
        </h3>
        <HelpCircle className="w-5 h-5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
      </div>

      <AnimatePresence>
        {showTooltip && (
          <>
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowMobileTooltip(false)}
              />
            )}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`${
                isMobile
                  ? 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-md z-50'
                  : 'absolute z-50 left-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)]'
              }`}
              onMouseEnter={() => !isMobile && handleMouseEnter()}
              onMouseLeave={() => !isMobile && handleMouseLeave()}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 max-h-[80vh] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {description}
                  </p>
                </div>

                {tenseInfo && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                        When to Use
                      </p>
                      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {tenseInfo.instructions.split('\n').filter(line => line.trim().startsWith('-')).map((line, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                            <span>{line.replace(/^-\s*/, '')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {tenseInfo.timeMarkers.length > 0 && tenseInfo.timeMarkers[0] !== 'varies by tense' && tenseInfo.timeMarkers[0] !== 'varies by context' && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Time Markers
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {tenseInfo.timeMarkers.slice(0, 6).map((marker, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium"
                            >
                              {marker}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {tenseInfo.examples.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Example
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-2">
                          <p className="text-sm text-gray-900 dark:text-white font-medium">
                            {tenseInfo.examples[0].spanish.replace('_____', tenseInfo.examples[0].correctForm)}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                            {tenseInfo.examples[0].english}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {isMobile && (
                  <button
                    onClick={() => setShowMobileTooltip(false)}
                    className="mt-4 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
