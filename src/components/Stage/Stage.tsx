import { useRef, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Phase } from '../../types';
import type { ShoeGenerationResult } from '../../engine/types';
import type { GenerationError } from '../../hooks/useSynthesizer';
import { PHASE } from '../../constants/phases';
import { ShoeReveal } from './ShoeReveal';

/** Single place to tune generation camera choreography. */
const ZOOM_TOTAL_SEC = 10;
const ZOOM_STORAGE_KEY = 'shoegen.zoom.shots.v1';
type ZoomShot = {
  id: 'computer' | 'claw' | 'soles' | 'glass-shoe' | 'joystick';
  label: string;
  scale: number;
  targetX: number;
  targetY: number;
  holdSec: number;
  inSec: number;
  outSec: number;
};

/**
 * Five POI shots requested:
 * 1) main computer center
 * 2) roof claw
 * 3) right wall soles
 * 4) left glass vibrating shoe
 * 5) right joystick console
 */
const DEFAULT_ZOOM_SHOTS: ZoomShot[] = [
  { id: 'computer', label: 'Main Computer', scale: 2.8, targetX: 50, targetY: 48, holdSec: 1.35, inSec: 0.45, outSec: 0.3 },
  { id: 'claw', label: 'Roof Claw', scale: 2.2, targetX: 52, targetY: 18, holdSec: 1.1, inSec: 0.4, outSec: 0.3 },
  { id: 'soles', label: 'Right Soles', scale: 2.0, targetX: 78, targetY: 50, holdSec: 1.0, inSec: 0.35, outSec: 0.3 },
  { id: 'glass-shoe', label: 'Glass Shoe', scale: 2.6, targetX: 22, targetY: 50, holdSec: 1.2, inSec: 0.45, outSec: 0.35 },
  { id: 'joystick', label: 'Joystick Console', scale: 1.9, targetX: 80, targetY: 68, holdSec: 0.9, inSec: 0.35, outSec: 0.3 },
];

function isValidShotId(id: string): id is ZoomShot['id'] {
  return id === 'computer' || id === 'claw' || id === 'soles' || id === 'glass-shoe' || id === 'joystick';
}

function normalizeZoomShots(input: unknown): ZoomShot[] | null {
  if (!Array.isArray(input)) return null;
  const normalized: ZoomShot[] = [];
  for (const item of input) {
    if (!item || typeof item !== 'object') return null;
    const raw = item as Record<string, unknown>;
    const id = String(raw.id);
    if (!isValidShotId(id)) return null;
    if (typeof raw.label !== 'string') return null;
    if (
      typeof raw.scale !== 'number' ||
      typeof raw.targetX !== 'number' ||
      typeof raw.targetY !== 'number' ||
      typeof raw.holdSec !== 'number' ||
      typeof raw.inSec !== 'number' ||
      typeof raw.outSec !== 'number'
    ) {
      return null;
    }
    normalized.push({
      id,
      label: raw.label,
      scale: raw.scale,
      targetX: clamp(raw.targetX, 0, 100),
      targetY: clamp(raw.targetY, 0, 100),
      holdSec: raw.holdSec,
      inSec: raw.inSec,
      outSec: raw.outSec,
    });
  }
  if (normalized.length !== DEFAULT_ZOOM_SHOTS.length) return null;
  return normalized;
}

function loadZoomShotsFromStorage(): ZoomShot[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ZOOM_STORAGE_KEY);
    if (!raw) return null;
    return normalizeZoomShots(JSON.parse(raw));
  } catch {
    return null;
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toOffsetPct(targetPct: number, scale: number) {
  // Scale-aware conversion:
  // to center a scene point at zoom scale, translation grows with scale.
  const safeScale = scale <= 0 ? 1 : scale;
  return `${(50 - targetPct) * safeScale}%`;
}

function buildZoomKeyframes(shots: ZoomShot[]) {
  const times: number[] = [0];
  const scale: number[] = [1];
  const x: string[] = ['0%'];
  const y: string[] = ['0%'];
  const sequenceTotalSec = shots.reduce((sum, shot) => sum + shot.inSec + shot.holdSec + shot.outSec, 0);
  let tSec = 0;
  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];
    tSec += shot.inSec;
    times.push(tSec / sequenceTotalSec);
    scale.push(shot.scale);
    x.push(toOffsetPct(shot.targetX, shot.scale));
    y.push(toOffsetPct(shot.targetY, shot.scale));
    tSec += shot.holdSec;
    times.push(tSec / sequenceTotalSec);
    scale.push(shot.scale);
    x.push(toOffsetPct(shot.targetX, shot.scale));
    y.push(toOffsetPct(shot.targetY, shot.scale));

    // Travel to next shot directly (do not bounce to center between shots).
    // Only the last shot uses outSec to return to center before reveal.
    tSec += shot.outSec;
    times.push(tSec / sequenceTotalSec);
    if (i < shots.length - 1) {
      const next = shots[i + 1];
      scale.push(next.scale);
      x.push(toOffsetPct(next.targetX, next.scale));
      y.push(toOffsetPct(next.targetY, next.scale));
    } else {
      scale.push(1);
      x.push('0%');
      y.push('0%');
    }
  }
  times.push(1);
  scale.push(1);
  x.push('0%');
  y.push('0%');
  return { times, scale, x, y };
}

interface StageProps {
  phase: Phase;
  isShaking: boolean;
  onEquipShoe: () => void;
  onHover?: () => void;
  shoeResult?: ShoeGenerationResult | null;
  generationError?: GenerationError | null;
}

const shakeKeyframes = {
  x: [0, -8, 6, -5, 4, -2, 0],
  y: [0, 4, -6, 5, -3, 1, 0],
  rotate: [0, -0.6, 0.6, -0.4, 0.3, -0.1, 0],
};

export function Stage({ phase, isShaking, onEquipShoe, onHover, shoeResult, generationError }: StageProps) {
  const zoomDebug = typeof window !== 'undefined' && window.location.search.includes('zoomdebug=1');
  const videoRef = useRef<HTMLVideoElement>(null);
  const zoomDebugRef = useRef<HTMLDivElement>(null);
  const [dragShotId, setDragShotId] = useState<ZoomShot['id'] | null>(null);
  const [zoomShots, setZoomShots] = useState<ZoomShot[]>(() => loadZoomShotsFromStorage() ?? DEFAULT_ZOOM_SHOTS);
  const zoomKeyframes = useMemo(() => buildZoomKeyframes(zoomShots), [zoomShots]);
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

  useEffect(() => {
    if (!zoomDebug || !dragShotId) return;

    const onMove = (e: PointerEvent) => {
      const rect = zoomDebugRef.current?.getBoundingClientRect();
      if (!rect) return;
      const xPct = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
      const yPct = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
      setZoomShots((prev) =>
        prev.map((shot) => (shot.id === dragShotId ? { ...shot, targetX: xPct, targetY: yPct } : shot)),
      );
    };

    const onUp = () => setDragShotId(null);

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragShotId, zoomDebug]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(ZOOM_STORAGE_KEY, JSON.stringify(zoomShots));
    } catch {
      // Ignore storage errors; zoom still works for this session.
    }
  }, [zoomShots]);

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
            style={{ position: 'relative' }}
            animate={
              phase === PHASE.PROCESSING
                ? {
                    scale: zoomKeyframes.scale,
                    x: zoomKeyframes.x,
                    y: zoomKeyframes.y,
                  }
                : { scale: 1, x: '0%', y: '0%' }
            }
            transition={
              phase === PHASE.PROCESSING
                ? {
                    duration: ZOOM_TOTAL_SEC,
                    times: zoomKeyframes.times,
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

            {zoomDebug && (
              <div
                ref={zoomDebugRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              >
                {zoomShots.map((shot) => (
                  <button
                    key={shot.id}
                    type="button"
                    onPointerDown={(e) => {
                      if (phase === PHASE.PROCESSING) return;
                      e.preventDefault();
                      setDragShotId(shot.id);
                    }}
                    title={`Drag ${shot.label}`}
                    style={{
                      position: 'absolute',
                      left: `${shot.targetX}%`,
                      top: `${shot.targetY}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 30,
                      height: 30,
                      borderRadius: '999px',
                      border: '2px solid #ff3b30',
                      background: 'rgba(255,59,48,0.14)',
                      color: '#fff',
                      fontSize: 9,
                      fontFamily: 'monospace',
                      cursor: phase === PHASE.PROCESSING ? 'default' : 'grab',
                      pointerEvents: 'auto',
                      boxShadow: '0 0 0 2px rgba(0,0,0,0.45)',
                    }}
                  >
              {zoomShots.findIndex((s) => s.id === shot.id) + 1}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
        <div className="stage__overlay" />
      </div>

      {zoomDebug && (
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: 12,
            zIndex: 70,
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid rgba(255,59,48,0.45)',
            background: 'rgba(8, 8, 12, 0.82)',
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: 11,
            lineHeight: 1.45,
            pointerEvents: 'none',
            maxWidth: 420,
          }}
        >
          <div style={{ color: '#ff9f99', marginBottom: 4 }}>
            Zoom Debug: drag markers; points auto-save for normal mode
          </div>
          {zoomShots.map((shot, index) => (
            <div key={shot.id}>
              {index + 1}. {shot.id}: scale {shot.scale.toFixed(2)}, x {toOffsetPct(shot.targetX, shot.scale)}, y {toOffsetPct(shot.targetY, shot.scale)}, hold {shot.holdSec}s
            </div>
          ))}
        </div>
      )}

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
            onHover={onHover}
            shoeResult={shoeResult ?? null}
            generationError={generationError ?? null}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
