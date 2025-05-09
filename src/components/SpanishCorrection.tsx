import { useState } from 'react';
import { SpanishCorrectionModal } from './SpanishCorrectionModal';

interface SpanishCorrectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpanishCorrection({ isOpen, onClose }: SpanishCorrectionProps) {
  return (
    <SpanishCorrectionModal isOpen={isOpen} onClose={onClose} />
  );
}