import { useState } from 'react';
import ProgressComponent from '../components/ProgressComponent';
import { SpeakingPractice } from '../components/SpeakingPractice';
import { SpanishCorrection } from '../components/SpanishCorrection';

export function DashboardPage() {
  const [isSpeakingModalOpen, setIsSpeakingModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ProgressComponent 
        onSpeakingPracticeClick={() => setIsSpeakingModalOpen(true)}
      />
      <SpeakingPractice 
        isOpen={isSpeakingModalOpen}
        onClose={() => setIsSpeakingModalOpen(false)}
      />
      <SpanishCorrection
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
      />

      {/* Correction System Button */}
      <button
        onClick={() => setIsCorrectionModalOpen(true)}
        className="mt-8 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors w-full"
      >
        Spanish Correction System
      </button>
    </div>
  );
}