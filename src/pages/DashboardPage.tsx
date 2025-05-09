import { useState } from 'react';
import { SpeakingPractice } from '../components/SpeakingPractice';
import { SpanishCorrection } from '../components/SpanishCorrection';
import { Book, BookOpen, Headphones, Mic, ChevronRight } from 'lucide-react';

export function DashboardPage() {
  const [isSpeakingModalOpen, setIsSpeakingModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Progress Overview */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-indigo-200 tracking-wide mb-6">
            YOUR SPANISH PROGRESS
          </h1>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-white">
                  You're at B1 (45%)
                </h2>
                <span className="text-indigo-200">Next: B2 (55%)</span>
              </div>

              <div className="relative h-3 bg-indigo-950/50 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-indigo-400 rounded-full transition-all duration-500"
                  style={{ width: '45%' }}
                />
                <div className="absolute inset-0 flex justify-between px-2 text-xs font-medium">
                  {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level, i) => (
                    <span 
                      key={level}
                      className={`${i < 3 ? 'text-indigo-900' : 'text-indigo-200'}`}
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-indigo-200 mb-4">
                To reach B2 (55%), you need:
              </h3>
              <ul className="space-y-4 text-white">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Learn 1900 more words from these categories: Business, Technology, Environment, Politics</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Master 6 more grammar structures: past perfect, subjunctive, future perfect...</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Increase listening comprehension speed by 25 words per minute</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
                <Book className="w-5 h-5" />
                <span>Practice Vocabulary</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
                <BookOpen className="w-5 h-5" />
                <span>Study Grammar</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
                <Headphones className="w-5 h-5" />
                <span>Listening Practice</span>
              </button>
              <button 
                onClick={() => setIsSpeakingModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
              >
                <Mic className="w-5 h-5" />
                <span>Speaking Practice</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Vocabulary Practice
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  15 new words learned today
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Grammar Study
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Completed Present Perfect lesson
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Study Streak
            </h3>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center text-xl font-bold text-orange-600 dark:text-orange-400">
                7
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Days in a Row
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Keep up the great work!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-2 rounded-full bg-orange-500"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Correction System Button */}
      <button
        onClick={() => setIsCorrectionModalOpen(true)}
        className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-medium rounded-xl transition-colors shadow-lg hover:shadow-xl"
      >
        Spanish Correction System
      </button>

      <SpeakingPractice 
        isOpen={isSpeakingModalOpen}
        onClose={() => setIsSpeakingModalOpen(false)}
      />
      <SpanishCorrection
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
      />
    </div>
  );
}