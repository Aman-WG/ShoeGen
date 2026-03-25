import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Phase } from '../../types';
import { PHASE } from '../../constants/phases';
import { checkPrompt } from '../../utils/contentFilter';

const PROMPT_LIMIT = 30;

const PLACEHOLDERS = [
  'Neon cyberpunk high-tops with glowing soles...',
  'Retro chunky sneakers dripping in gold...',
  'Icy crystal kicks with frozen lightning bolts...',
  'Sakura blossom runners with pink mist trail...',
  'Radioactive slime boots with electric green glow...',
  'Holographic space shoes with orbiting stars...',
];

const PRESETS = [
  { label: '🔥 Fire Walker', prompt: 'Blazing fire sneakers with molten lava soles and ember trails' },
  { label: '❄️ Ice Breakers', prompt: 'Frozen crystal high-tops with icicle laces and frost glow' },
  { label: '🌀 Void Runners', prompt: 'Dark void running shoes with purple energy swirls and gravity-defying soles' },
];

const SHOE_STYLES = [
  { id: 'high-top', label: 'High-top', icon: '/icons/shoe-styles/high-top.png' },
  { id: 'mid-top', label: 'Mid-top', icon: '/icons/shoe-styles/mid-top.png' },
  { id: 'pointy-high', label: 'Pointy high', icon: '/icons/shoe-styles/pointy-high.png' },
  { id: 'pointy-mid', label: 'Pointy mid', icon: '/icons/shoe-styles/pointy-mid.png' },
  { id: 'strap-shoes', label: 'Strap shoes', icon: '/icons/shoe-styles/strap-shoes.png' },
];

interface InteractionAreaProps {
  phase: Phase;
  isTypingComplete: boolean;
  onGenerateShoe: (prompt: string, style: string) => void;
  onHover?: () => void;
  coinBalance?: number | null;
  generateCost: number;
  canAffordGeneration: boolean;
}

const slideIn = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
};

export function InteractionArea({
  phase,
  isTypingComplete,
  onGenerateShoe,
  onHover,
  coinBalance,
  generateCost,
  canAffordGeneration,
}: InteractionAreaProps) {
  return (
    <div className="interaction-area">
      <AnimatePresence mode="wait">
        {phase === PHASE.PROMPT && isTypingComplete && (
          <motion.div key="prompt" className="interaction-area__content" {...slideIn}>
            <PromptInputUI
              onGenerate={onGenerateShoe}
              onHover={onHover}
              generateCost={generateCost}
              canAffordGeneration={canAffordGeneration}
              coinBalance={coinBalance}
            />
          </motion.div>
        )}

        {phase === PHASE.PROCESSING && (
          <motion.div key="processing" className="interaction-area__content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="processing-bar"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 10, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PromptInputUI({
  onGenerate,
  onHover,
  generateCost,
  canAffordGeneration,
  coinBalance,
}: {
  onGenerate: (prompt: string, style: string) => void;
  onHover?: () => void;
  generateCost: number;
  canAffordGeneration: boolean;
  coinBalance?: number | null;
}) {
  const [text, setText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(() => Math.floor(Math.random() * PLACEHOLDERS.length));
  const [hasError, setHasError] = useState(false);
  const [stopCycling, setStopCycling] = useState(false);
  const hasWallet = typeof coinBalance === 'number';

  useEffect(() => {
    if (stopCycling) return;
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [stopCycling]);

  useEffect(() => {
    if (hasError) setHasError(false);
  }, [text]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const overLimit = wordCount > PROMPT_LIMIT;
  const canSubmit = canAffordGeneration && !!selectedStyle;

  const handleSubmit = () => {
    if (overLimit || !canAffordGeneration || !selectedStyle) return;
    const prompt = text.trim() || 'classic fresh kicks';
    const result = checkPrompt(prompt);
    if (!result.ok) {
      setHasError(true);
      return;
    }
    setHasError(false);
    onGenerate(prompt, selectedStyle);
  };

  return (
    <div className="prompt-ui">
      {/* Step 1: Style selection — always visible */}
      <div className="prompt-ui__styles" role="group" aria-label="Shoe style">
        {SHOE_STYLES.map((style) => {
          const isActive = selectedStyle === style.id;
          return (
            <motion.button
              key={style.id}
              type="button"
              className={`prompt-ui__style-chip ${isActive ? 'prompt-ui__style-chip--active' : ''}`}
              onClick={() => setSelectedStyle(isActive ? null : style.id)}
              onMouseEnter={onHover}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              aria-pressed={isActive}
            >
              <img src={style.icon} alt="" className="prompt-ui__style-icon" draggable={false} />
              <span>{style.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Step 2: Prompt section — reveals after style is selected */}
      <AnimatePresence>
        {selectedStyle && (
          <motion.div
            className="prompt-ui__prompt-section"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="prompt-ui__step2-title">Now describe your kicks. Be wild!</div>
            <div className="prompt-ui__row">
              <div className="prompt-ui__left">
                <div className="prompt-ui__input-wrap">
                  <input
                    type="text"
                    className={`prompt-ui__input${hasError ? ' prompt-ui__input--error' : ''}`}
                    placeholder={PLACEHOLDERS[placeholderIdx]}
                    value={text}
                    onChange={(e) => { setText(e.target.value); setStopCycling(true); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmit();
                    }}
                    autoFocus
                  />
                  <span className={`prompt-ui__wc ${overLimit ? 'prompt-ui__wc--over' : ''}`}>
                    {wordCount}/{PROMPT_LIMIT}
                  </span>
                </div>

                <div className="prompt-ui__presets">
                  {PRESETS.map((p) => (
                    <motion.button
                      key={p.prompt}
                      className={`prompt-ui__chip ${text === p.prompt ? 'prompt-ui__chip--active' : ''}`}
                      onClick={() => {
                        if (text === p.prompt) {
                          setText('');
                          setStopCycling(false);
                        } else {
                          setText(p.prompt);
                          setStopCycling(true);
                        }
                      }}
                      onMouseEnter={onHover}
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {p.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="prompt-ui__generate-wrap">
                <motion.button
                  className={`pixel-btn pixel-btn--generate ${!canSubmit ? 'pixel-btn--disabled' : ''}`}
                  onClick={handleSubmit}
                  onMouseEnter={canSubmit ? onHover : undefined}
                  disabled={!canSubmit}
                  whileHover={canSubmit ? { scale: 1.06, y: -2 } : undefined}
                  whileTap={canSubmit ? { scale: 0.94 } : undefined}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <span className="generate-btn__label">FORGE</span>
                  <span className="generate-btn__cost-pill">
                    <span className="generate-btn__coin-icon" aria-hidden="true" />
                    <span>{generateCost.toLocaleString()}</span>
                  </span>
                </motion.button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {hasError ? (
                <motion.div
                  key="error"
                  className="prompt-ui__error"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  Content flagged — try a different prompt.
                </motion.div>
              ) : hasWallet && !canAffordGeneration ? (
                <motion.div key="wallet" className="prompt-ui__wallet-warning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Not enough coins. You need {(generateCost - (coinBalance ?? 0)).toLocaleString()} more to forge.
                </motion.div>
              ) : (
                <motion.div key="disclaimer" className="prompt-ui__disclaimer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Prompts are logged and visible to your teacher. Keep it legendary, not sus.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
