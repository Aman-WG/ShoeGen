import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Phase } from '../../types';
import type { ShoeGenerationResult } from '../../engine/types';
import type { GenerationError } from '../../hooks/useSynthesizer';
import { PHASE } from '../../constants/phases';
import { ShoeReveal } from './ShoeReveal';

/** Single place to tune zoom depth and drama. Order: left (shoe glass) → center (computer) → top (lever) → right (soles). */
const ZOOM_TOTAL_SEC = 10;
const ZOOM_IN_OUT_SEC = 0.4;
const ZOOM_SHOTS: { scale: number; x: string; y: string; holdSec: number }[] = [
  { scale: 1.5, x: '-18%', y: '0%', holdSec: 1.2 },
  { scale: 3, x: '0%', y: '0%', holdSec: 2 },
  { scale: 2, x: '0%', y: '-14%', holdSec: 1.5 },
  { scale: 2, x: '18%', y: '0%', holdSec: 1.2 },
];

function buildZoomKeyframes() {
  const times: number[] = [0];
  const scale: number[] = [1];
  const x: string[] = ['0%'];
  const y: string[] = ['0%'];
  let t = 0;
  for (const shot of ZOOM_SHOTS) {
    const zoomIn = ZOOM_IN_OUT_SEC / ZOOM_TOTAL_SEC;
    const hold = shot.holdSec / ZOOM_TOTAL_SEC;
    const zoomOut = ZOOM_IN_OUT_SEC / ZOOM_TOTAL_SEC;
    t += zoomIn;
    times.push(t);
    scale.push(shot.scale);
    x.push(shot.x);
    y.push(shot.y);
    t += hold;
    times.push(t);
    scale.push(shot.scale);
    x.push(shot.x);
    y.push(shot.y);
    t += zoomOut;
    times.push(t);
    scale.push(1);
    x.push('0%');
    y.push('0%');
  }
  times.push(1);
  scale.push(1);
  x.push('0%');
  y.push('0%');
  return { times, scale, x, y };
}

const ZOOM_KEYFRAMES = buildZoomKeyframes();

interface StageProps {
  phase: Phase;
  isShaking: boolean;
  onEquipShoe: () => void;
  onRetry: () => void;
  onHover?: () => void;
  avatarImageUrl?: string;
  shoeResult?: ShoeGenerationResult | null;
  generationError?: GenerationError | null;
}

const shakeKeyframes = {
  x: [0, -8, 6, -5, 4, -2, 0],
  y: [0, 4, -6, 5, -3, 1, 0],
  rotate: [0, -0.6, 0.6, -0.4, 0.3, -0.1, 0],
};

export function Stage({ phase, isShaking, onEquipShoe, onRetry, onHover, avatarImageUrl, shoeResult, generationError }: StageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoCandidates = [
    '/video/kling_video.mp4',
    '/video/Seamless_Looping_Animation_Video_Ready.mp4',
    '/video/lab-bg.mp4',
  ];
  const [videoCandidateIdx, setVideoCandidateIdx] = useState(0);
  const videoSrc = videoCandidates[videoCandidateIdx];
  const [videoUnavailable, setVideoUnavailable] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.playsInline = true;
    const tryPlay = () => {
      video.play().catch(() => {
        const h = () => { video.play(); document.removeEventListener('click', h); };
        document.addEventListener('click', h);
      });
    };
    if (video.readyState >= 2) tryPlay();
    else video.addEventListener('loadeddata', tryPlay, { once: true });
  }, [videoSrc]);

  const handleVideoError = () => {
    if (videoCandidateIdx < videoCandidates.length - 1) {
      setVideoCandidateIdx((idx) => idx + 1);
      return;
    }
    setVideoUnavailable(true);
  };

  return (
    <motion.div
      className="stage"
      animate={isShaking ? shakeKeyframes : { x: 0, y: 0, rotate: 0 }}
      transition={
        isShaking
          ? { duration: 0.12, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
          : { duration: 0.3, ease: 'easeOut' }
      }
    >
      <div
        className={`stage__bg ${videoUnavailable ? 'stage__bg--fallback' : ''} ${phase === PHASE.REVEAL ? 'stage__bg--reveal' : ''}`}
      >
        <div className="stage__video-zoom">
          <motion.div
            className={`stage__video-inner ${phase === PHASE.PROCESSING ? 'stage__video-inner--zooming' : ''}`}
            animate={
              phase === PHASE.PROCESSING
                ? {
                    scale: ZOOM_KEYFRAMES.scale,
                    x: ZOOM_KEYFRAMES.x,
                    y: ZOOM_KEYFRAMES.y,
                  }
                : { scale: 1, x: '0%', y: '0%' }
            }
            transition={
              phase === PHASE.PROCESSING
                ? {
                    duration: ZOOM_TOTAL_SEC,
                    times: ZOOM_KEYFRAMES.times,
                    ease: 'easeInOut',
                  }
                : { duration: 0.5, ease: 'easeOut' }
            }
          >
            <video
              ref={videoRef}
              className="stage__video"
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onError={handleVideoError}
            />
          </motion.div>
        </div>
        <div className="stage__overlay" />
      </div>

      {/* Machine sprite removed for now; restore with: <SteamPress phase={phase} isLooping={phase === PHASE.PROCESSING} /> */}

      <div className="scanlines" />
      <div className="vignette" />

      <AnimatePresence>
        {isShaking && (
          <>
            <motion.div
              className="stage__flicker"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0, 0.1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="stage__flashbang"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0, 0, 0.9, 0, 0, 0, 0.7, 0, 0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === PHASE.REVEAL && (
          <ShoeReveal
            key="shoe-reveal"
            onEquip={onEquipShoe}
            onRetry={onRetry}
            onHover={onHover}
            avatarImageUrl={avatarImageUrl}
            shoeResult={shoeResult ?? null}
            generationError={generationError ?? null}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
