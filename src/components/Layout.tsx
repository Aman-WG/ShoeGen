import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Stage } from './Stage';
import { Console } from './Console';
import { IntroSplash } from './IntroSplash';
import { ConfirmExitModal } from './ConfirmExitModal';
import { SpendConfirmModal } from './SpendConfirmModal';
import { useTypewriter } from '../hooks/useTypewriter';
import { useSound } from '../hooks/useSound';
import { soundManager } from '../sound/SoundManager';
import { useSynthesizer } from '../hooks/useSynthesizer';
import { useBridge } from '../context/ParentBridgeContext';
import { PHASE } from '../constants/phases';
import { DIALOGUE, PROCESSING_LINES } from '../constants/dialogue';
import { generateShoe } from '../engine/backend/shoe-generator';
import type { ShoeGenerationResult } from '../engine/types';

const CONSOLE_ENTRANCE_DELAY = 0;
const TYPEWRITER_START_DELAY = 300;
const GENERATION_DURATION = 10000;
const GENERATE_COST = 10000;

export function Layout() {
  const synth = useSynthesizer();
  const sfx = useSound({
    onFirstGesture: () => soundManager.playIntroWhoosh(),
  });
  const bridge = useBridge();

  const [showIntro, setShowIntro] = useState(true);
  const [showConsole, setShowConsole] = useState(false);
  const [startTyping, setStartTyping] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [liveResult, setLiveResult] = useState<ShoeGenerationResult | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSpendConfirm, setShowSpendConfirm] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState('');
  const [pendingStyle, setPendingStyle] = useState('');
  const phaseRef = useRef(synth.phase);
  phaseRef.current = synth.phase;
  const coinBalance =
    typeof bridge.avatarData?.coinBalance === 'number' ? bridge.avatarData.coinBalance : null;
  const canAffordGeneration = coinBalance == null || coinBalance >= GENERATE_COST;

  // ── Dismiss handling ──
  const requestDismiss = useCallback(() => {
    const phase = phaseRef.current;
    bridge.clearCloseRequest();
    if (phase === PHASE.PROCESSING) {
      return;
    }
    if (phase === PHASE.REVEAL) {
      setShowExitModal(true);
    } else {
      bridge.sendClose();
    }
  }, [bridge]);

  const handleSaveAndExit = useCallback(() => {
    setShowExitModal(false);
    sfx.equip();
    bridge.sendEquipped({ style: synth.selectedStyle, prompt: synth.prompt }, liveResult);
  }, [sfx, bridge, synth.prompt, synth.selectedStyle, liveResult]);

  const handleKeepTweaking = useCallback(() => {
    setShowExitModal(false);
  }, []);

  useEffect(() => {
    if (!bridge.closeRequested) return;
    const t = window.setTimeout(() => requestDismiss(), 0);
    return () => window.clearTimeout(t);
  }, [bridge.closeRequested, requestDismiss]);

  useEffect(() => {
    phaseRef.current = synth.phase;
  }, [synth.phase]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showExitModal) {
        setShowExitModal(false);
        return;
      }
      requestDismiss();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [requestDismiss, showExitModal]);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    const t1 = setTimeout(() => setShowConsole(true), CONSOLE_ENTRANCE_DELAY);
    const t2 = setTimeout(() => setStartTyping(true), CONSOLE_ENTRANCE_DELAY + TYPEWRITER_START_DELAY);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    bridge.sendPhaseChange(synth.phase);
  }, [synth.phase, bridge]);

  useEffect(() => {
    if (!showConsole) return;
    setStartTyping(false);
    const t = setTimeout(() => setStartTyping(true), 250);
    return () => clearTimeout(t);
  }, [synth.phase, showConsole]);

  // ── Cycling processing lines ──
  const [processingLine, setProcessingLine] = useState(() =>
    PROCESSING_LINES[Math.floor(Math.random() * PROCESSING_LINES.length)]
  );

  useEffect(() => {
    if (synth.phase !== PHASE.PROCESSING) return;
    setProcessingLine(PROCESSING_LINES[Math.floor(Math.random() * PROCESSING_LINES.length)]);
    const interval = setInterval(() => {
      setProcessingLine((prev) => {
        let next = prev;
        while (next === prev) {
          next = PROCESSING_LINES[Math.floor(Math.random() * PROCESSING_LINES.length)];
        }
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [synth.phase]);

  const currentLines = useMemo(() => {
    if (synth.phase === PHASE.IDLE && attemptCount > 1) {
      return [
        `Pair #${attemptCount} incoming. Forge primed.`,
        attemptCount === 2
          ? "Last pair's locked in. Let's cook something new."
          : attemptCount === 3
            ? "Three pairs deep. The forge's warming up to you."
            : "You're building a whole collection. Go off.",
      ];
    }
    if (synth.phase === PHASE.PROCESSING) {
      return [processingLine];
    }
    return DIALOGUE[synth.phase].map((d) => d.text);
  }, [synth.phase, attemptCount, processingLine]);

  const tw = useTypewriter(currentLines, startTyping, {
    speed: 25,
    onChar: () => sfx.typewriterTick(),
    onLineComplete: () => sfx.keystroke(),
  });

  // Auto-transition from IDLE → PROMPT once greeting dialogue finishes typing
  useEffect(() => {
    if (synth.phase !== PHASE.IDLE || !tw.isComplete) return;
    const t = setTimeout(() => {
      synth.setPhase(PHASE.PROMPT);
    }, 600);
    return () => clearTimeout(t);
  }, [synth.phase, tw.isComplete, synth]);

  const aiAbortRef = useRef<AbortController | null>(null);
  const genResultRef = useRef<{ result: ShoeGenerationResult; source: 'ai' | 'fallback'; error?: string } | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRequestGenerate = useCallback((prompt: string, style: string) => {
    if (!canAffordGeneration) return;
    setPendingPrompt(prompt);
    setPendingStyle(style);
    setShowSpendConfirm(true);
  }, [canAffordGeneration]);

  const handleConfirmGenerate = useCallback(() => {
    setShowSpendConfirm(false);
    const prompt = pendingPrompt;
    const style = pendingStyle;

    // Charge coins on generate
    if (coinBalance != null) {
      bridge.sendSpendCoins(GENERATE_COST, 'shoe-generation');
    }

    sfx.glitch();
    sfx.startMachine();
    sfx.startLaser();
    sfx.startTension();

    synth.setPrompt(prompt);
    synth.setSelectedStyle(style);
    synth.setPhase(PHASE.PROCESSING);
    synth.setShaking(true);

    if (revealTimerRef.current != null) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    aiAbortRef.current?.abort();
    const abort = new AbortController();
    aiAbortRef.current = abort;
    genResultRef.current = null;

    const apiKey = localStorage.getItem('shoegen_api_key') || '';
    const fallbackResult: ShoeGenerationResult = {
      previewImageUrl: null,
      shoeName: 'Mystery Kicks',
      shoePrompt: prompt,
      metadata: { source: 'fallback' },
    };

    generateShoe({ prompt, style }, apiKey, abort.signal)
      .then((genResult) => {
        if (abort.signal.aborted) return;
        genResultRef.current = genResult;
        synth.setShoeResult(genResult.result);
        setLiveResult(genResult.result);
        synth.setGenerationError({ source: genResult.source, error: genResult.error });
      })
      .catch((err) => {
        if (abort.signal.aborted) return;
        const fallback = {
          result: fallbackResult,
          source: 'fallback' as const,
          error: err instanceof Error ? err.message : 'Generation failed',
        };
        genResultRef.current = fallback;
        synth.setShoeResult(fallbackResult);
        setLiveResult(fallbackResult);
        synth.setGenerationError({ source: 'fallback', error: fallback.error });
      });

    revealTimerRef.current = window.setTimeout(() => {
      revealTimerRef.current = null;
      if (abort.signal.aborted) return;

      sfx.stopMachine();
      sfx.stopLaser();
      sfx.stopTension();
      sfx.shatterReveal();

      const final = genResultRef.current ?? {
        result: fallbackResult,
        source: 'fallback' as const,
        error: 'Backend not connected yet',
      };
      synth.setShoeResult(final.result);
      setLiveResult(final.result);
      synth.setGenerationError({ source: final.source, error: final.error });
      synth.setShaking(false);
      synth.setPhase(PHASE.REVEAL);
    }, GENERATION_DURATION);
  }, [sfx, synth, bridge, coinBalance, pendingPrompt, pendingStyle]);

  const handleEquipShoe = useCallback(() => {
    sfx.equip();
    bridge.sendEquipped({ style: synth.selectedStyle, prompt: synth.prompt }, liveResult);
  }, [sfx, bridge, synth.prompt, synth.selectedStyle, liveResult]);

  const hideConsole = synth.phase === PHASE.REVEAL;

  return (
    <div className="game-viewport">
      <div className="game-window">
        <AnimatePresence>
          {showIntro && <IntroSplash onComplete={handleIntroComplete} />}
        </AnimatePresence>

        {coinBalance != null && (
          <div className="wallet-hud">
            <span className="wallet-hud__label">STUDENT WALLET</span>
            <span className="wallet-hud__value">◉ {coinBalance.toLocaleString()} coins</span>
          </div>
        )}

        <div className="game-window__stage">
          <Stage
            phase={synth.phase}
            isShaking={synth.isShaking}
            onEquipShoe={handleEquipShoe}
            onHover={sfx.hover}
            shoeResult={liveResult}
            generationError={synth.generationError}
          />
        </div>

        {showConsole && !hideConsole && (
          <div className="game-window__console">
            <Console
              phase={synth.phase}
              displayedLines={tw.displayedLines}
              isTyping={tw.isTyping}
              isTypingComplete={tw.isComplete}
              onGenerateShoe={handleRequestGenerate}
              onHover={sfx.hover}
              coinBalance={coinBalance}
              generateCost={GENERATE_COST}
              canAffordGeneration={canAffordGeneration}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showExitModal && (
          <ConfirmExitModal
            onSaveAndExit={handleSaveAndExit}
            onKeepTweaking={handleKeepTweaking}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSpendConfirm && (
          <SpendConfirmModal
            cost={GENERATE_COST}
            onConfirm={handleConfirmGenerate}
            onCancel={() => setShowSpendConfirm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
