import { motion } from 'framer-motion';

interface IntroSplashProps {
  onComplete: () => void;
  /** Optional: intro sound is now played on first user gesture via Layout/useSound */
  onSound?: () => void;
}

const HOLD_DURATION = 3800;
const FADE_DURATION = 1200;

export function IntroSplash({ onComplete }: IntroSplashProps) {
  return (
    <motion.div
      className="intro-splash"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{
        duration: FADE_DURATION / 1000,
        delay: HOLD_DURATION / 1000,
        ease: 'easeInOut',
      }}
      onAnimationComplete={onComplete}
    >
      <div className="intro-splash__scanlines" />

      <motion.div
        className="intro-splash__sweep"
        initial={{ top: '-4px' }}
        animate={{ top: '104%' }}
        transition={{ delay: 1.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="intro-splash__center">
        <motion.div
          className="intro-splash__welcome"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
        >
          Welcome to
        </motion.div>

        <motion.div
          className="intro-splash__title-wrap"
          initial={{ opacity: 0, scale: 1.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 1.0,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div className="intro-splash__title" data-text="SHOE FORGE">
            <span className="intro-splash__title-main">SHOE FORGE</span>
          </div>

          <motion.div
            className="intro-splash__glitch intro-splash__glitch--r"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0, 0.6, 0, 0.7, 0, 0] }}
            transition={{ delay: 1.6, duration: 0.6, ease: 'linear' }}
          >
            SHOE FORGE
          </motion.div>
          <motion.div
            className="intro-splash__glitch intro-splash__glitch--b"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0, 0.8, 0, 0.5, 0, 0] }}
            transition={{ delay: 1.65, duration: 0.55, ease: 'linear' }}
          >
            SHOE FORGE
          </motion.div>
        </motion.div>

        <motion.div
          className="intro-splash__sub"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.7, ease: 'easeOut' }}
        >
          // Q-BIT SHOE WORKSHOP v1.0
        </motion.div>

        <motion.p
          className="intro-splash__hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Click or tap to start
        </motion.p>
      </div>

      <div className="intro-splash__corner intro-splash__corner--tl" />
      <div className="intro-splash__corner intro-splash__corner--tr" />
      <div className="intro-splash__corner intro-splash__corner--bl" />
      <div className="intro-splash__corner intro-splash__corner--br" />
    </motion.div>
  );
}
