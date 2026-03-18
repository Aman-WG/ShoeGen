import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Stage } from './Stage';
import { Console } from './Console';
import { IntroSplash } from './IntroSplash';
import { ConfirmExitModal } from './ConfirmExitModal';
import { useTypewriter } from '../hooks/useTypewriter';
import { useSound } from '../hooks/useSound';
import { soundManager } from '../sound/SoundManager';
import { useSynthesizer } from '../hooks/useSynthesizer';
import { useBridge } from '../context/ParentBridgeContext';
import { PHASE } from '../constants/phases';
import { DIALOGUE } from '../constants/dialogue';
import { generateShoe } from '../engine/backend/shoe-generator';
import type { ShoeGenerationResult } from '../engine/types';

const CONSOLE_ENTRANCE_DELAY = 800;
const TYPEWRITER_START_DELAY = 600;
const GENERATION_DURATION = 10000;
const INITIATE_COST = 2000;

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
  const [isInitiatingCharge, setIsInitiatingCharge] = useState(false);
  const phaseRef = useRef(synth.phase);
  phaseRef.current = synth.phase;
  const initiateFlowTimeoutRef = useRef<number | null>(null);
  const coinBalance =
    typeof bridge.avatarData?.coinBalance === 'number' ? bridge.avatarData.coinBalance : null;
  const canAffordInitiation = coinBalance == null || coinBalance >= INITIATE_COST;
  const shortfall = coinBalance == null ? 0 : Math.max(0, INITIATE_COST - coinBalance);

  const requestDismiss = useCallback(() => {
    const phase = phaseRef.current;
    if (phase === PHASE.PROCESSING) {
      bridge.clearCloseRequest();
      return;
    }
    bridge.clearCloseRequest();
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
    if (bridge.closeRequested) requestDismiss();
  }, [bridge.closeRequested]);

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

  useEffect(() => {
    return () => {
      if (initiateFlowTimeoutRef.current != null) {
        window.clearTimeout(initiateFlowTimeoutRef.current);
      }
    };
  }, []);

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

  const currentLines = useMemo(() => {
    if (synth.phase === PHASE.IDLE && coinBalance != null && !canAffordInitiation) {
      return [
        'Shoe workshop fee detected: 2,000 coins.',
        `Wallet shortfall: ${shortfall.toLocaleString()} coins. Earn a bit more in the shop to unlock the forge.`,
      ];
    }
    if (synth.phase === PHASE.IDLE && attemptCount > 1) {
      return [
        `Re-attempting shoe generation: Attempt ${attemptCount}`,
        attemptCount === 2
          ? "Previous design didn't hit. Let's run it back."
          : attemptCount === 3
            ? 'Persistence detected. The forge remembers your style.'
            : "You're practically a regular now. Fire when ready.",
      ];
    }
    return DIALOGUE[synth.phase].map((d) => d.text);
  }, [synth.phase, attemptCount, coinBalance, canAffordInitiation, shortfall]);

  const tw = useTypewriter(currentLines, startTyping, {
    speed: 25,
    lineDelay: 400,
    onChar: () => sfx.typewriterTick(),
    onLineComplete: () => sfx.keystroke(),
  });

  const handleInitiate = useCallback(() => {
    if (!canAffordInitiation || isInitiatingCharge) return;
    if (coinBalance != null) {
      bridge.sendSpendCoins(INITIATE_COST, 'shoe-generation');
      setIsInitiatingCharge(true);
    }
    sfx.initiate();
    const startDelay = coinBalance != null ? 900 : 0;
    if (initiateFlowTimeoutRef.current != null) {
      window.clearTimeout(initiateFlowTimeoutRef.current);
    }
    initiateFlowTimeoutRef.current = window.setTimeout(() => {
      setIsInitiatingCharge(false);
      synth.setPhase(PHASE.PROMPT);
      initiateFlowTimeoutRef.current = null;
    }, startDelay);
  }, [bridge, canAffordInitiation, coinBalance, isInitiatingCharge, sfx, synth]);

  const aiAbortRef = useRef<AbortController | null>(null);
  const genResultRef = useRef<{ result: ShoeGenerationResult; source: 'ai' | 'fallback'; error?: string } | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleGenerateShoe = useCallback((prompt: string, style: string) => {
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
  }, [sfx, synth]);

  const handleEquipShoe = useCallback(() => {
    sfx.equip();
    bridge.sendEquipped({ style: synth.selectedStyle, prompt: synth.prompt }, liveResult);
  }, [sfx, bridge, synth.prompt, synth.selectedStyle, liveResult]);

  const handleRetry = useCallback(() => {
    sfx.select();
    bridge.sendRetry();
    setAttemptCount((n) => n + 1);
    setLiveResult(null);
    setIsInitiatingCharge(false);
    synth.reset();
  }, [sfx, synth, bridge]);

  const consoleHeight = synth.phase === PHASE.PROMPT ? '30%' : '20%';
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
            onRetry={handleRetry}
            onHover={sfx.hover}
            avatarImageUrl={bridge.avatarData?.avatarImageUrl}
            shoeResult={liveResult}
            generationError={synth.generationError}
          />
        </div>

        {showConsole && !hideConsole && (
          <div
            className="game-window__console"
            style={{ height: consoleHeight, transition: 'height 0.4s ease' }}
          >
            <Console
              phase={synth.phase}
              displayedLines={tw.displayedLines}
              isTyping={tw.isTyping}
              isTypingComplete={tw.isComplete}
              onInitiate={handleInitiate}
              onGenerateShoe={handleGenerateShoe}
              onHover={sfx.hover}
              coinBalance={coinBalance}
              initiateCost={INITIATE_COST}
              canAffordInitiation={canAffordInitiation}
              isInitiatingCharge={isInitiatingCharge}
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
    </div>
  );
}
