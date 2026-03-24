import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ShoeGenerationResult } from '../../engine/types';

/** Generated shoe asset for now (replace with live result when ready). */
const REVEAL_SHOE_URL = '/assets/mu_afshoe.png';

const CELEBRATION_LINES = [
  'Drippiest kicks ready!',
  'Heat levels: MAXIMUM.',
  'Fresh out the forge!',
  'These go crazy.',
  'Certified grails.',
  'Main character shoes unlocked.',
  'The hallways aren\'t ready.',
  'Shoe game: ASCENDED.',
  'Straight from the future.',
  'Fire walk with these.',
];

interface ShoeRevealProps {
  onEquip: () => void;
  onHover?: () => void;
  shoeResult: ShoeGenerationResult | null;
  generationError?: { source: 'ai' | 'fallback'; error?: string } | null;
}

const SPARKLE_COUNT = 14;
const CENTER_HOLD_MS = 1800;

function toTwoWordName(name?: string): string {
  const words = (name ?? 'Mystery Kicks')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .slice(0, 2);
  if (words.length === 0) return 'Mystery Kicks';
  if (words.length === 1) return `${words[0]} Kicks`;
  return `${words[0]} ${words[1]}`;
}

const sparkles = Array.from({ length: SPARKLE_COUNT }, (_, i) => {
  const angle = (360 / SPARKLE_COUNT) * i;
  const radius = 38 + Math.random() * 28;
  const size = 3 + Math.random() * 4;
  const delay = Math.random() * 2;
  return { angle, radius, size, delay, id: i };
});

export function ShoeReveal({
  onEquip,
  onHover,
  shoeResult,
  generationError,
}: ShoeRevealProps) {
  const [settled, setSettled] = useState(false);
  const shoeName = toTwoWordName(shoeResult?.shoeName);
  const [celebrationLine, setCelebrationLine] = useState(() =>
    CELEBRATION_LINES[Math.floor(Math.random() * CELEBRATION_LINES.length)]
  );

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), CENTER_HOLD_MS);
    return () => clearTimeout(t);
  }, []);


  return (
    <motion.div
      className="reveal-unlock"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="reveal-unlock__dim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />

      <motion.div
        className="reveal-unlock__celebration"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
      >
        {celebrationLine}
      </motion.div>

      {/* White flash + star burst (sync with star sound) */}
      <motion.div
        className="reveal-unlock__white-flash"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.4, times: [0, 0.25, 1], ease: 'easeOut' }}
      />
      <motion.div
        className="reveal-unlock__star-burst"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.8, 2.2], opacity: [0, 0.85, 0] }}
        transition={{ duration: 0.5, times: [0, 0.3, 1], ease: 'easeOut' }}
      />
      <motion.div
        className="reveal-unlock__screen-slash"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 1], opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.35, times: [0, 0.4, 1], ease: 'easeOut' }}
      />

      {/* Shoe reveal hero — "Who's that Pokémon?" style */}
      <div className="reveal-unlock__hero-wrap">
        <motion.div className="reveal-unlock__hero" initial={{ x: 0, scale: 1 }} animate={{ x: 0, scale: 1 }}>
          <motion.div
            className="reveal-unlock__windmill"
            initial={{ opacity: 0, scale: 0.3, rotate: 0 }}
            animate={{
              opacity: settled ? 0 : [0, 0.8, 0.6],
              scale: settled ? 0.6 : [0.3, 1.3, 1.1],
              rotate: 360,
            }}
            transition={{
              opacity: { duration: settled ? 0.4 : 0.8, ease: 'easeOut' },
              scale: { duration: settled ? 0.4 : 0.9, type: 'spring', stiffness: 60, damping: 14 },
              rotate: { duration: 12, repeat: Infinity, ease: 'linear' },
            }}
          />

          <motion.div
            className="reveal-unlock__rays"
            initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
            animate={{
              opacity: settled ? 0.2 : 0.45,
              scale: settled ? 0.85 : 1.1,
              rotate: 360,
            }}
            transition={{
              opacity: { duration: 0.8, ease: 'easeOut' },
              scale: { duration: 0.8, type: 'spring', stiffness: 50, damping: 12 },
              rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            }}
          />

          {/* Silhouette scales up from center, then reveals to shoe (Who's that Pokémon?) */}
          <motion.div
            className="reveal-unlock__character"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 1],
              scale: [0, 0, 1.25, 1],
            }}
            transition={{
              duration: 1.35,
              times: [0, 0.35, 0.85, 1],
              ease: ['easeOut', 'easeOut', [0.22, 1, 0.36, 1]],
            }}
          >
            <motion.img
              src={REVEAL_SHOE_URL}
              alt="Shoe"
              className="reveal-unlock__img"
              draggable={false}
              style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))' }}
              animate={{
                filter: [
                  'brightness(0) contrast(1.2)',
                  'brightness(0) contrast(1.2)',
                  'brightness(1) contrast(1)',
                  'brightness(1) contrast(1)',
                ],
                y: [0, -6, 0, 4, 0],
              }}
              transition={{
                filter: {
                  duration: 1.35,
                  times: [0, 0.7, 0.9, 1],
                  ease: 'easeOut',
                },
                y: {
                  delay: 1.5,
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            />
          </motion.div>

          <div className="reveal-unlock__particles">
            {sparkles.map((s) => (
              <motion.div
                key={s.id}
                className="reveal-unlock__sparkle"
                style={{
                  width: s.size,
                  height: s.size,
                  left: `calc(50% + ${Math.cos((s.angle * Math.PI) / 180) * s.radius}%)`,
                  top: `calc(50% + ${Math.sin((s.angle * Math.PI) / 180) * s.radius}%)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: settled ? 0 : [0, 1, 0], scale: settled ? 0 : [0, 1.5, 0] }}
                transition={{
                  delay: 1.4 + s.delay * 0.3,
                  duration: 1.4,
                  repeat: Infinity,
                  repeatDelay: s.delay * 0.6,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        className="reveal-unlock__shoe-name-below"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.4, ease: 'easeOut' }}
      >
        {`${shoeName} Sneakers`}
      </motion.div>

      <AnimatePresence>
        {settled && (
          <motion.div
            className="reveal-unlock__cta-dock"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150, damping: 18 }}
          >
            <button className="pixel-btn" onClick={onEquip} onMouseEnter={onHover}>
              Save &amp; Equip
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
