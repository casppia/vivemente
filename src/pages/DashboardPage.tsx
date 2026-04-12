import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SpeakingPractice } from '../components/SpeakingPractice';
import { SpanishCorrection } from '../components/SpanishCorrection';
import {
  Book,
  BookOpen,
  Headphones,
  Mic,
  Flame,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  SpellCheck,
  GitCompare,
  Type,
} from 'lucide-react';

const LEVEL_LABELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const CURRENT_LEVEL = 'B1';
const NEXT_LEVEL = 'B2';
const PROGRESS_PCT = 45;

const MILESTONES = [
  { label: 'Learn 1,900 more words', sub: 'Business, Technology, Environment, Politics', done: false },
  { label: 'Master 6 grammar structures', sub: 'Past perfect, subjunctive, future perfect…', done: false },
  { label: 'Increase listening speed by 25 wpm', sub: 'Listening comprehension', done: false },
];

const QUICK_ACTIONS = [
  { label: 'Vocabulary', icon: Book,       route: '/topics',     color: 'bg-blue-500'    },
  { label: 'Grammar',    icon: BookOpen,    route: '/study',      color: 'bg-emerald-500' },
  { label: 'Listening',  icon: Headphones,  route: '/podcast',    color: 'bg-amber-500'   },
  { label: 'Compare',    icon: GitCompare,  route: '/comparison', color: 'bg-cyan-500'    },
  { label: 'Generate',   icon: Type,        route: '/generate',   color: 'bg-rose-500'    },
  { label: 'Speaking',   icon: Mic,         route: null,          color: 'bg-violet-500'  },
];

const STREAK_DAYS = 7;
const STREAK_TOTAL = 10;

const ACTIVITY = [
  { icon: Book,     color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20',    title: 'Vocabulary Practice',  sub: '15 new words learned today'         },
  { icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', title: 'Grammar Study',     sub: 'Completed Present Perfect lesson'   },
  { icon: Headphones, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20',  title: 'Listening Practice',   sub: '20 min podcast session'             },
];

const STATS = [
  { label: 'Words Learned', value: '824',  sub: '+15 today',   color: 'text-blue-600 dark:text-blue-400'    },
  { label: 'Study Streak',  value: `${STREAK_DAYS}d`, sub: 'Personal best', color: 'text-orange-600 dark:text-orange-400' },
  { label: 'Grammar Items', value: '18',   sub: '6 remaining', color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Level Progress',value: `${PROGRESS_PCT}%`, sub: `To ${NEXT_LEVEL}`, color: 'text-sky-600 dark:text-sky-400' },
];

export function DashboardPage() {
  const [isSpeakingModalOpen, setIsSpeakingModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (route: string | null) => {
    if (route) navigate(route);
    else setIsSpeakingModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 pb-24">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Welcome back</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Your Dashboard</h1>
        </div>
        <button
          onClick={() => setIsCorrectionModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
        >
          <SpellCheck className="w-4 h-4" />
          Correction
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-0.5">{stat.label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Level progress card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-500" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Level Progress</h2>
            </div>
            <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">
              {CURRENT_LEVEL} → {NEXT_LEVEL}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            You're <strong>{PROGRESS_PCT}%</strong> of the way to {NEXT_LEVEL}
          </p>

          {/* Progress bar with level markers */}
          <div className="relative mb-3">
            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${PROGRESS_PCT}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full"
              />
            </div>
            <div className="flex justify-between mt-2">
              {LEVEL_LABELS.map((level) => (
                <span
                  key={level}
                  className={`text-xs font-semibold ${
                    level === CURRENT_LEVEL
                      ? 'text-sky-600 dark:text-sky-400'
                      : level === NEXT_LEVEL
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {level}
                </span>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
              To reach {NEXT_LEVEL}
            </p>
            {MILESTONES.map((m, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${m.done ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{m.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{m.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleAction(action.route)}
                className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Study Streak</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Keep going — don't break the chain!</p>
            </div>
          </div>

          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-bold text-orange-500">{STREAK_DAYS}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1.5">days in a row</span>
          </div>

          <div className="flex gap-1.5">
            {[...Array(STREAK_TOTAL)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full transition-all ${
                  i < STREAK_DAYS
                    ? 'bg-orange-500'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">0</span>
            <span className="text-xs text-gray-400">{STREAK_TOTAL} day goal</span>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {ACTIVITY.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-9 h-9 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

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
