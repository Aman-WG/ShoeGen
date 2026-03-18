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

const SHOE_STYLES = ['Low Ankle', 'High Ankle', 'Slip-On', 'Boots'];

interface InteractionAreaProps {
  phase: Phase;
  isTypingComplete: boolean;
  onInitiate: () => void;
  onGenerateShoe: (prompt: string, style: string) => void;
  onHover?: () => void;
  onPromptError?: (msg: string | null) => void;
  coinBalance?: number | null;
  initiateCost: number;
  canAffordInitiation: boolean;
  isInitiatingCharge: boolean;
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
  onInitiate,
  onGenerateShoe,
  onHover,
  onPromptError,
  coinBalance,
  initiateCost,
  canAffordInitiation,
  isInitiatingCharge,
}: InteractionAreaProps) {
  const hasWallet = typeof coinBalance === 'number';
  const shortfall = hasWallet ? Math.max(0, initiateCost - coinBalance) : 0;

  return (
    <div className="interaction-area">
      <AnimatePresence mode="wait">
        {phase === PHASE.IDLE && isTypingComplete && (
          <motion.div key="idle" className="interaction-area__content interaction-area__content--center" {...slideIn}>
            <div className="idle-cta">
              <AnimatePresence>
                {isInitiatingCharge && (
                  <motion.div
                    className="idle-cta__debit"
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.95 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      x: [0, 42, 120, 220],
                      y: [0, -18, -54, -138],
                      scale: [0.95, 1.04, 0.98, 0.86],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut', times: [0, 0.2, 0.6, 1] }}
                  >
                    <span className="idle-cta__debit-burst">- {initiateCost.toLocaleString()} COINS</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                className={`pixel-btn pixel-btn--lg idle-cta__launch-btn ${(!canAffordInitiation || isInitiatingCharge) ? 'pixel-btn--disabled' : ''}`}
                onClick={onInitiate}
                onMouseEnter={canAffordInitiation && !isInitiatingCharge ? onHover : undefined}
                disabled={!canAffordInitiation || isInitiatingCharge}
                whileHover={canAffordInitiation && !isInitiatingCharge ? { scale: 1.06, y: -3 } : undefined}
                whileTap={canAffordInitiation && !isInitiatingCharge ? { scale: 0.94 } : undefined}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <span className="idle-cta__launch-copy">
                  <span className="idle-cta__launch-icon">👟</span>
                  <span>{isInitiatingCharge ? 'FIRING UP...' : 'START THE FORGE'}</span>
                  <span className="idle-cta__launch-icon">👟</span>
                </span>
                <span className="idle-cta__cost-pill">
                  <span className="idle-cta__coin-icon" aria-hidden="true" />
                  <span>{initiateCost}</span>
                </span>
              </motion.button>

              {hasWallet && !canAffordInitiation && (
                <div className="interaction-hint interaction-hint--warning">
                  You need {shortfall.toLocaleString()} more coins before the forge can craft your kicks.
                </div>
              )}

              {hasWallet && canAffordInitiation && !isInitiatingCharge && (
                <div className="interaction-hint">
                  Your wallet will be charged the moment the forge boots up.
                </div>
              )}

              {!hasWallet && !isInitiatingCharge && (
                <div className="interaction-hint">
                  Shoe generation costs {initiateCost.toLocaleString()} coins when launched from the shop.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {phase === PHASE.PROMPT && isTypingComplete && (
          <motion.div key="prompt" className="interaction-area__content" {...slideIn}>
            <PromptInputUI onGenerate={onGenerateShoe} onHover={onHover} onPromptError={onPromptError} />
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
  onPromptError,
}: {
  onGenerate: (prompt: string, style: string) => void;
  onHover?: () => void;
  onPromptError?: (msg: string | null) => void;
}) {
  const [text, setText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(() => Math.floor(Math.random() * PLACEHOLDERS.length));
  const [hasError, setHasError] = useState(false);
  const [styleMissingError, setStyleMissingError] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hasError || styleMissingError) {
      setHasError(false);
      setStyleMissingError(false);
      onPromptError?.(null);
    }
  }, [text, selectedStyle]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const overLimit = wordCount > PROMPT_LIMIT;

  const handleSubmit = () => {
    if (overLimit) return;
    if (!selectedStyle) {
      setStyleMissingError(true);
      onPromptError?.('Pick a shoe style before forging.');
      return;
    }
    const prompt = text.trim() || 'classic fresh kicks';
    const result = checkPrompt(prompt);
    if (!result.ok) {
      setHasError(true);
      setStyleMissingError(false);
      onPromptError?.(result.reason ?? 'Invalid prompt');
      return;
    }
    setHasError(false);
    setStyleMissingError(false);
    onPromptError?.(null);
    onGenerate(prompt, selectedStyle);
  };

  return (
    <div className="prompt-ui">
      <div className="prompt-ui__styles" role="group" aria-label="Shoe style">
        {SHOE_STYLES.map((style) => {
          const isActive = selectedStyle === style;
          return (
            <motion.button
              key={style}
              type="button"
              className={`prompt-ui__style-chip ${isActive ? 'prompt-ui__style-chip--active' : ''}`}
              onClick={() => setSelectedStyle(style)}
              onMouseEnter={onHover}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              aria-pressed={isActive}
            >
              {style}
            </motion.button>
          );
        })}
      </div>

      <div className="prompt-ui__row">
        <div className="prompt-ui__input-wrap">
          <input
            type="text"
            className={`prompt-ui__input${hasError ? ' prompt-ui__input--error' : ''}`}
            placeholder={PLACEHOLDERS[placeholderIdx]}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            autoFocus
          />
          <span className={`prompt-ui__wc ${overLimit ? 'prompt-ui__wc--over' : ''}`}>
            {wordCount}/{PROMPT_LIMIT}
          </span>
        </div>
        <motion.button
          className={`pixel-btn pixel-btn--sm ${!selectedStyle ? 'pixel-btn--disabled' : ''}`}
          onClick={handleSubmit}
          onMouseEnter={selectedStyle ? onHover : undefined}
          whileHover={selectedStyle ? { scale: 1.05 } : undefined}
          whileTap={selectedStyle ? { scale: 0.95 } : undefined}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          disabled={!selectedStyle}
        >
          FORGE
        </motion.button>
      </div>

      <div className="prompt-ui__presets">
        {PRESETS.map((p) => (
          <motion.button
            key={p.prompt}
            className="prompt-ui__chip"
            onClick={() => setText(p.prompt)}
            onMouseEnter={onHover}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
          >
            {p.label}
          </motion.button>
        ))}
      </div>

      <div className="prompt-ui__disclaimer">
        👀 Heads up — prompts are logged and visible to your teacher. Keep it legendary, not sus.
      </div>
    </div>
  );
}
