import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Phase } from '../../types';
import { PHASE } from '../../constants/phases';
import { DialogueBox } from './DialogueBox';
import { InteractionArea } from './InteractionArea';

interface ConsoleProps {
  phase: Phase;
  displayedLines: string[];
  isTyping: boolean;
  isTypingComplete: boolean;
  onInitiate: () => void;
  onGenerateShoe: (prompt: string, style: string) => void;
  onHover?: () => void;
  coinBalance?: number | null;
  initiateCost: number;
  canAffordInitiation: boolean;
  isInitiatingCharge: boolean;
}

export function Console({
  phase,
  displayedLines,
  isTyping,
  isTypingComplete,
  onInitiate,
  onGenerateShoe,
  onHover,
  coinBalance,
  initiateCost,
  canAffordInitiation,
  isInitiatingCharge,
}: ConsoleProps) {
  const isRow = phase === PHASE.IDLE;
  const isPrompt = phase === PHASE.PROMPT;
  const [promptError, setPromptError] = useState<string | null>(null);

  const handlePromptError = (msg: string | null) => setPromptError(msg);

  return (
    <motion.div
      className="console"
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        y: { type: 'spring', stiffness: 170, damping: 22, mass: 0.8 },
        opacity: { duration: 0.3 },
      }}
    >
      <div className={`console__body ${isRow ? 'console__body--row' : ''} ${isPrompt ? 'console__body--prompt' : ''}`}>
        <DialogueBox lines={displayedLines} isTyping={isTyping} errorText={promptError} />
        <InteractionArea
          phase={phase}
          isTypingComplete={isTypingComplete}
          onInitiate={onInitiate}
          onGenerateShoe={onGenerateShoe}
          onHover={onHover}
          onPromptError={handlePromptError}
          coinBalance={coinBalance}
          initiateCost={initiateCost}
          canAffordInitiation={canAffordInitiation}
          isInitiatingCharge={isInitiatingCharge}
        />
      </div>
    </motion.div>
  );
}
