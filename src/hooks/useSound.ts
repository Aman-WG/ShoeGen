import { useCallback, useRef, useEffect } from 'react';
import { soundManager } from '../sound/SoundManager';

interface UseSoundOptions {
  enabled?: boolean;
  /** Called once when the user first triggers resume (click/tap/key). Use for intro/reveal sound. */
  onFirstGesture?: () => void;
}

/**
 * React hook wrapping the ZzFX-based SoundManager.
 * Provides stable callbacks for every sound in the Shoe Workshop flow
 * and auto-cleans up all looping sounds on unmount.
 */
export function useSound(options: UseSoundOptions = {}) {
  const { enabled = true, onFirstGesture } = options;
  const machineStopRef = useRef<(() => void) | null>(null);
  const tensionStopRef = useRef<(() => void) | null>(null);
  const firstGestureFiredRef = useRef(false);
  const onFirstGestureRef = useRef(onFirstGesture);
  onFirstGestureRef.current = onFirstGesture;

  useEffect(() => {
    soundManager.setEnabled(enabled);
  }, [enabled]);

  // Resume AudioContext on first user gesture and play intro/reveal sound so it's not silent
  useEffect(() => {
    const resume = () => {
      soundManager.resumeAudioContext();
      if (!firstGestureFiredRef.current && onFirstGestureRef.current) {
        firstGestureFiredRef.current = true;
        onFirstGestureRef.current();
      }
      document.removeEventListener('click', resume, true);
      document.removeEventListener('touchstart', resume, true);
      document.removeEventListener('keydown', resume);
    };
    document.addEventListener('click', resume, { passive: true, capture: true });
    document.addEventListener('touchstart', resume, { passive: true, capture: true });
    document.addEventListener('keydown', resume, true);
    return () => {
      firstGestureFiredRef.current = false;
      document.removeEventListener('click', resume, true);
      document.removeEventListener('touchstart', resume, true);
      document.removeEventListener('keydown', resume, true);
    };
  }, []);

  useEffect(() => {
    return () => soundManager.stopAll();
  }, []);

  const hover = useCallback(() => soundManager.playHover(), []);
  const select = useCallback(() => soundManager.playSelectElement(), []);
  const keystroke = useCallback(() => soundManager.playKeystroke(), []);
  const typewriterTick = useCallback(() => soundManager.playTypewriterTick(), []);
  const initiate = useCallback(() => soundManager.playInitiate(), []);
  const glitch = useCallback(() => soundManager.playGlitch(), []);
  const shatterReveal = useCallback(() => soundManager.playShatterReveal(), []);
  const equip = useCallback(() => soundManager.playEquip(), []);
  const introWhoosh = useCallback(() => soundManager.playIntroWhoosh(), []);
  const pressClose = useCallback(() => soundManager.playPressClose(), []);
  const revealOpen = useCallback(() => soundManager.playRevealOpen(), []);

  const laserBurst = useCallback(() => soundManager.playLaserBurst(), []);
  const startLaser = useCallback(() => soundManager.startLaser(), []);
  const stopLaser = useCallback(() => soundManager.stopLaser(), []);

  const startMachine = useCallback(() => {
    machineStopRef.current?.();
    machineStopRef.current = soundManager.playMachineLoading();
  }, []);

  const stopMachine = useCallback(() => {
    machineStopRef.current?.();
    machineStopRef.current = null;
  }, []);

  const startTension = useCallback(() => {
    tensionStopRef.current?.();
    tensionStopRef.current = soundManager.startTension();
  }, []);

  const stopTension = useCallback(() => {
    tensionStopRef.current?.();
    tensionStopRef.current = null;
  }, []);

  return {
    hover,
    select,
    keystroke,
    typewriterTick,
    initiate,
    glitch,
    shatterReveal,
    equip,
    introWhoosh,
    pressClose,
    revealOpen,
    laserBurst,
    startLaser,
    stopLaser,
    startMachine,
    stopMachine,
    startTension,
    stopTension,
  };
}
