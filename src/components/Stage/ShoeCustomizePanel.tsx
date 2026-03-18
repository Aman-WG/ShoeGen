import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ShoeGenerationResult } from '../../engine/types';

export interface ShoeCustomizations {
  material: string | null;
  sole: string | null;
  glow: boolean;
  colorShift: number;
}

interface ShoeCustomizePanelProps {
  shoeResult: ShoeGenerationResult;
  onCustomize: (customizations: ShoeCustomizations) => void;
  onHover?: () => void;
}

const MATERIAL_OPTIONS = [
  { id: 'leather', label: 'Leather' },
  { id: 'mesh', label: 'Mesh' },
  { id: 'suede', label: 'Suede' },
  { id: 'metallic', label: 'Metallic' },
  { id: 'holographic', label: 'Holo' },
  { id: 'pixel', label: 'Pixel' },
] as const;

const SOLE_OPTIONS = [
  { id: 'flat', label: 'Flat' },
  { id: 'chunky', label: 'Chunky' },
  { id: 'platform', label: 'Platform' },
  { id: 'air', label: 'Air' },
] as const;

function initCustomizations(): ShoeCustomizations {
  return {
    material: null,
    sole: null,
    glow: false,
    colorShift: 0,
  };
}

export function ShoeCustomizePanel({ shoeResult: _shoeResult, onCustomize, onHover }: ShoeCustomizePanelProps) {
  const [customs, setCustoms] = useState<ShoeCustomizations>(initCustomizations);

  const pendingRef = useRef<ShoeCustomizations | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const flush = useCallback(() => {
    if (pendingRef.current) {
      onCustomize(pendingRef.current);
      pendingRef.current = null;
    }
  }, [onCustomize]);

  const emit = useCallback(
    (next: ShoeCustomizations) => {
      setCustoms(next);
      pendingRef.current = next;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(flush);
    },
    [flush],
  );

  return (
    <motion.div
      className="aura-modifiers"
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 120, damping: 18 }}
    >
      <div className="aura-modifiers__title-wrap">
        <div className="aura-modifiers__title-glow">Customize your kicks</div>
        <div className="aura-modifiers__title">Customize your kicks</div>
      </div>

      {/* Material */}
      <div className="aura-modifiers__section">
        <div className="aura-modifiers__section-label">Material</div>
        <div className="aura-modifiers__physics-grid">
          {MATERIAL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`aura-modifiers__physics-btn${customs.material === opt.id ? ' aura-modifiers__physics-btn--active' : ''}`}
              onClick={() => emit({ ...customs, material: customs.material === opt.id ? null : opt.id })}
              onMouseEnter={onHover}
            >
              <span className="aura-modifiers__physics-label">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="aura-modifiers__divider" />

      {/* Sole */}
      <div className="aura-modifiers__section">
        <div className="aura-modifiers__section-label">Sole</div>
        <div className="aura-modifiers__physics-grid">
          {SOLE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`aura-modifiers__physics-btn${customs.sole === opt.id ? ' aura-modifiers__physics-btn--active' : ''}`}
              onClick={() => emit({ ...customs, sole: customs.sole === opt.id ? null : opt.id })}
              onMouseEnter={onHover}
            >
              <span className="aura-modifiers__physics-label">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="aura-modifiers__divider" />

      {/* Color Shift */}
      <div className="aura-modifiers__section">
        <div className="aura-modifiers__section-label">Color Shift</div>
        <div className="aura-modifiers__range-row">
          <span className="aura-modifiers__range-end">Cool</span>
          <div className="aura-modifiers__tick-slider">
            <input
              type="range"
              className="aura-modifiers__slider"
              min={0}
              max={100}
              step={1}
              value={customs.colorShift}
              onChange={(e) => emit({ ...customs, colorShift: parseInt(e.target.value) })}
              onMouseEnter={onHover}
              style={{ '--slider-pct': `${customs.colorShift}%` } as React.CSSProperties}
            />
          </div>
          <span className="aura-modifiers__range-end">Warm</span>
        </div>
      </div>

      {/* Glow toggle */}
      <div className="aura-modifiers__section">
        <button
          className={`aura-modifiers__physics-btn${customs.glow ? ' aura-modifiers__physics-btn--active' : ''}`}
          onClick={() => emit({ ...customs, glow: !customs.glow })}
          onMouseEnter={onHover}
          style={{ width: '100%' }}
        >
          <span className="aura-modifiers__physics-label">
            {customs.glow ? 'Glow: ON' : 'Glow: OFF'}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
