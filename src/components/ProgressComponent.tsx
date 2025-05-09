import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';

interface ProgressComponentProps {
  onSpeakingPracticeClick: () => void;
}

const ProgressComponent = ({ onSpeakingPracticeClick }: ProgressComponentProps) => {
  const [userData, setUserData] = useState({
    currentLevel: 'B1',
    nextLevel: 'B2',
    knownWords: 2100,
    masteredGrammarStructures: ['present perfect', 'conditional simple', 'past continuous'],
    listeningSpeed: 125,
    overallProgress: 45
  });
  
  const [progressData, setProgressData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  
  // Define level thresholds
  const levelThresholds = {
    'A1': { min: 0, max: 15 },
    'A2': { min: 15, max: 30 },
    'B1': { min: 30, max: 55 },
    'B2': { min: 55, max: 75 },
    'C1': { min: 75, max: 90 },
    'C2': { min: 90, max: 100 }
  };
  
  // Vocabulary categories for transitions
  const levelVocabCategories = {
    'A1_A2': ['Daily Life', 'Family', 'Shopping'],
    'A2_B1': ['Work', 'Travel', 'Health'],
    'B1_B2': ['Business', 'Technology', 'Environment', 'Politics'],
    'B2_C1': ['Abstract Concepts', 'Academic Topics', 'Cultural Nuances'],
    'C1_C2': ['Specialized Fields', 'Literary Expressions', 'Idiomatic Language']
  };
  
  // Grammar structures per level
  const grammarStructures = {
    'B1': ['present perfect', 'past continuous', 'conditional simple', 'will future'],
    'B2': ['past perfect', 'subjunctive', 'future perfect', 'passive voice', 'reported speech', 'complex conditionals']
  };
  
  // Calculate vocabulary progress
  const calculateVocabProgress = () => {
    const vocabTargets = {
      'A1': 800, 'A2': 1500, 'B1': 2500, 'B2': 4000, 'C1': 6000, 'C2': 8000
    };
    
    const currentTarget = vocabTargets[userData.currentLevel];
    const nextTarget = vocabTargets[userData.nextLevel];
    const vocabDelta = nextTarget - currentTarget;
    const remainingWords = nextTarget - userData.knownWords;
    
    return {
      progressPercent: Math.max(0, Math.min(100, ((userData.knownWords - currentTarget) / vocabDelta) * 100)),
      remainingWords: Math.max(0, remainingWords),
      totalWordsForNextLevel: vocabDelta
    };
  };
  
  // Calculate grammar progress
  const calculateGrammarProgress = () => {
    const nextLevelStructures = grammarStructures[userData.nextLevel] || [];
    const masteredNextLevelStructures = nextLevelStructures.filter(
      structure => userData.masteredGrammarStructures.includes(structure)
    );
    
    return {
      progressPercent: (masteredNextLevelStructures.length / nextLevelStructures.length) * 100,
      remainingStructures: nextLevelStructures.filter(
        structure => !userData.masteredGrammarStructures.includes(structure)
      ),
      totalStructures: nextLevelStructures.length
    };
  };
  
  // Calculate listening progress
  const calculateListeningProgress = () => {
    const listeningSpeedTargets = {
      'A1': 60, 'A2': 90, 'B1': 120, 'B2': 150, 'C1': 180, 'C2': 200
    };
    
    const currentTarget = listeningSpeedTargets[userData.currentLevel];
    const nextTarget = listeningSpeedTargets[userData.nextLevel];
    const speedDelta = nextTarget - currentTarget;
    
    return {
      progressPercent: Math.max(0, Math.min(100, ((userData.listeningSpeed - currentTarget) / speedDelta) * 100)),
      currentSpeed: userData.listeningSpeed,
      targetSpeed: nextTarget,
      speedGap: Math.max(0, nextTarget - userData.listeningSpeed)
    };
  };
  
  // Generate recommendations
  const generateRecommendations = (data) => {
    const recs = [];
    
    // Vocabulary recommendations
    if (data.vocab.remainingWords > 0) {
      const transitionKey = `${userData.currentLevel}_${userData.nextLevel}`;
      const vocabCategories = levelVocabCategories[transitionKey] || [];
      
      recs.push({
        type: 'vocabulary',
        message: `Learn ${data.vocab.remainingWords} more words from these categories: ${vocabCategories.join(', ')}`,
        action: 'Practice Vocabulary'
      });
    }
    
    // Grammar recommendations
    if (data.grammar.remainingStructures.length > 0) {
      recs.push({
        type: 'grammar',
        message: `Master ${data.grammar.remainingStructures.length} more grammar structures: ${data.grammar.remainingStructures.slice(0, 3).join(', ')}${data.grammar.remainingStructures.length > 3 ? '...' : ''}`,
        action: 'Study Grammar'
      });
    }
    
    // Listening recommendations
    if (data.listening.speedGap > 0) {
      recs.push({
        type: 'listening',
        message: `Increase listening comprehension speed by ${Math.round(data.listening.speedGap)} words per minute`,
        action: 'Listening Practice'
      });
    }
    
    return recs;
  };
  
  // Calculate all progress metrics
  useEffect(() => {
    const vocabProgress = calculateVocabProgress();
    const grammarProgress = calculateGrammarProgress();
    const listeningProgress = calculateListeningProgress();
    
    const allProgressData = {
      vocab: vocabProgress,
      grammar: grammarProgress,
      listening: listeningProgress
    };
    
    setProgressData(allProgressData);
    setRecommendations(generateRecommendations(allProgressData));
  }, [userData]);

  // Define CEFR levels for the progress bar
  const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  
  // Calculate the width for each level section (100% / 6 levels)
  const levelWidth = 100 / cefrLevels.length;

  return (
    <div className="w-full bg-gray-900 rounded-xl shadow-lg overflow-hidden p-8">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-indigo-400 tracking-wide">
          YOUR SPANISH PROGRESS
        </h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            You're at {userData.currentLevel} ({userData.overallProgress}%)
          </h2>

          {/* Progress Bar with All Levels */}
          <div className="relative pt-4">
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                style={{ width: `${userData.overallProgress}%` }}
              />
            </div>
            
            {/* Level Markers */}
            <div className="flex justify-between mt-2">
              {cefrLevels.map((level) => (
                <div
                  key={level}
                  className={`text-sm font-medium ${
                    level === userData.currentLevel
                      ? 'text-indigo-400'
                      : 'text-gray-400'
                  }`}
                  style={{ width: `${levelWidth}%`, textAlign: 'center' }}
                >
                  {level}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Level Requirements */}
        <div className="mt-12 space-y-4">
          <h2 className="text-gray-400 text-lg">
            To reach {userData.nextLevel} ({levelThresholds[userData.nextLevel].min}%), you need:
          </h2>
          
          <ul className="space-y-3">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="text-gray-300 flex items-start">
                <span className="mr-2">•</span>
                <span>{rec.message}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-8">
          <button className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors">
            Practice Vocabulary
          </button>
          <button className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors">
            Study Grammar
          </button>
          <button className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors">
            Listening Practice
          </button>
          <button 
            onClick={onSpeakingPracticeClick}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Mic className="w-5 h-5" />
            Speaking Practice
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressComponent;