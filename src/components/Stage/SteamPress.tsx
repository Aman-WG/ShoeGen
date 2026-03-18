import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Phase } from '../../types';
import { PHASE } from '../../constants/phases';

/** Machine sprite sheet: 36 frames. Put file in public/assets/. */
export const MACHINE_SPRITE_URL = '/assets/machine-sprite%201.jpg';
const MACHINE_SPRITE_FILENAME = 'machine-sprite 1.jpg';

/* Grid: 8 columns × 4 rows = 32 frames; frame 10 (col 2, row 1) is empty — skip it */
const COLS = 8;
const ROWS = 4;
const EMPTY_FRAME = 10; // col 2, row 1 (0-based)
const TOTAL_PHYSICAL = COLS * ROWS; // 32
const TOTAL_FRAMES = TOTAL_PHYSICAL - 1; // 31 (skip empty)
const LOOP_END = 23; // logical 0–22: idle/processing loop
const REVEAL_START = 23; // logical 23–30: reveal (8 frames, play once)
const FPS = 10;
const MS_PER_FRAME = 1000 / FPS;

interface SteamPressProps {
  phase: Phase;
  isLooping?: boolean;
}

/**
 * Machine sprite over the bg scene: 4×9 sheet, loop 0–23 for IDLE/PROCESSING,
 * play 24–35 once for REVEAL then hold on last frame.
 */
export function SteamPress({ phase, isLooping = false }: SteamPressProps) {
  const [frame, setFrame] = useState(0);
  const [spriteError, setSpriteError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPhaseRef = useRef<Phase>(phase);

  const isOpen = phase === PHASE.IDLE || phase === PHASE.PROMPT;
  const isProcessing = phase === PHASE.PROCESSING;
  const isReveal = phase === PHASE.REVEAL;
  const isVisible = isOpen || isProcessing || isReveal;

  useEffect(() => {
    if (phase === PHASE.REVEAL && prevPhaseRef.current !== PHASE.REVEAL) {
      setFrame(REVEAL_START);
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isReveal) {
      setFrame(REVEAL_START);
      let revealFrame = 0;
      const revealCount = TOTAL_FRAMES - REVEAL_START;
      intervalRef.current = setInterval(() => {
        revealFrame += 1;
        if (revealFrame >= revealCount) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setFrame(TOTAL_FRAMES - 1);
          return;
        }
        setFrame(REVEAL_START + revealFrame);
      }, MS_PER_FRAME);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }

    if (isOpen || isProcessing) {
      intervalRef.current = setInterval(() => {
        setFrame((f) => {
          const next = f + 1;
          if (next === EMPTY_FRAME) return EMPTY_FRAME + 1; // skip empty frame
          return next % LOOP_END;
        });
      }, MS_PER_FRAME);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [phase, isOpen, isProcessing, isReveal]);

  /* Logical frame → physical cell (skip EMPTY_FRAME) */
  const physicalFrame = frame < EMPTY_FRAME ? frame : frame + 1;
  const col = physicalFrame % COLS;
  const row = Math.floor(physicalFrame / COLS);
  const bgPosX = COLS > 1 ? (col / (COLS - 1)) * 100 : 0;
  const bgPosY = ROWS > 1 ? (row / (ROWS - 1)) * 100 : 0;

  return (
    <motion.div
      className={`steam-press steam-press--sprite ${!isVisible ? 'steam-press--hidden' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      aria-hidden
      data-looping={isLooping}
      data-phase={phase}
    >
      <div className="steam-press__machine-wrap">
        {spriteError ? (
          <div className="steam-press__sprite-fallback">
            <p>Machine sprite not found.</p>
            <p>Put <strong>{MACHINE_SPRITE_FILENAME}</strong> in <strong>public/assets/</strong></p>
          </div>
        ) : (
          <>
            <img
              src={MACHINE_SPRITE_URL}
              alt=""
              className="steam-press__sprite-preload"
              onError={() => setSpriteError(true)}
            />
            <div
              className="steam-press__sprite"
              style={{
                backgroundImage: `url(${MACHINE_SPRITE_URL})`,
                backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                backgroundPosition: `${bgPosX}% ${bgPosY}%`,
              }}
            />
            <div className="steam-press__gradient-overlay" aria-hidden />
          </>
        )}
      </div>
    </motion.div>
  );
}
