import { soundManager } from '../sound/SoundManager';

/** Resume context on click (browser requires user gesture), then play. */
function onPlay(fn: () => void) {
  soundManager.resumeAudioContext().then(fn);
}

/**
 * Ta-Da sound tuning. Open with ?soundtest=1 in the URL.
 * Click a variant (first click unlocks audio), then give one-line feedback.
 */
export function SoundTest() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #060c18 0%, #0a1228 100%)',
      color: '#b0e0f0',
      fontFamily: 'system-ui, sans-serif',
      padding: 24,
      boxSizing: 'border-box',
    }}>
      <h1 style={{ fontSize: 18, marginBottom: 8 }}>Reveal & achievement sound test</h1>
      <p style={{ fontSize: 13, marginBottom: 24, opacity: 0.9 }}>
        <strong>Click any button</strong> — first click unlocks sound (browser rule). Use the <strong>generator</strong> URL + <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 4px' }}>?soundtest=1</code> (e.g. localhost:5176/?soundtest=1).
      </p>

      <h2 style={{ fontSize: 14, marginBottom: 10, opacity: 0.95 }}>🌟 Star (CodePen)</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, marginBottom: 24 }}>
        <button type="button" onClick={() => onPlay(() => soundManager.playStar())} style={{ ...btnStyle, background: 'linear-gradient(180deg, #ffdd88 0%, #ccaa44 100%)', borderColor: 'rgba(255,220,100,0.8)' }}>
          🌟 Play Star sound (CodePen BaowKzv)
        </button>
      </div>

      <h2 style={{ fontSize: 14, marginBottom: 10, opacity: 0.95 }}>Ta-Da</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, marginBottom: 24 }}>
        <button type="button" onClick={() => onPlay(() => soundManager.playTaDaVariantA())} style={btnStyle}>
          A — Ta 400 → Da 420 (step up)
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playTaDaVariantB())} style={btnStyle}>
          B — Ta 350 → Da 440 (bigger step, longer Da)
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playTaDaVariantC())} style={btnStyle}>
          C — Ta 380 → Da 380 (same pitch)
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playShatterReveal())} style={{ ...btnStyle, borderColor: 'rgba(255,200,100,0.5)' }}>
          Reveal (used in app — 🌟 star)
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playJingleMarioStyleGrand())} style={{ ...btnStyle, opacity: 0.9 }}>
          Mario grand, chip (comparison)
        </button>
      </div>

      <h2 style={{ fontSize: 14, marginBottom: 10, opacity: 0.95 }}>Sci-fi celebratory — pick one for gacha</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, marginBottom: 24 }}>
        <button type="button" onClick={() => onPlay(() => soundManager.playRevealSciFiFanfare())} style={btnSciFi}>
          Sci-fi fanfare (used in app — triumphant rise)
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playRevealMissionComplete())} style={btnSciFi}>
          Mission complete — ding-ding-DAH
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playRevealDiscovery())} style={btnSciFi}>
          Discovery — shimmer then resolve
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playRevealVictorySting())} style={btnSciFi}>
          Victory sting 1 — quick 3-note punch (short)
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playRevealVictorySting2())} style={btnSciFi}>
          Victory sting 2 — 4 notes (more celebratory, slightly longer)
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playRevealVictorySting3())} style={btnSciFi}>
          Victory sting 3 — 5-note build (longer phrase, same tone throughout)
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playRevealVictorySting4())} style={btnSciFi}>
          Victory sting 4 — 6-note rise (full phrase, same melodious tone throughout)
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playRevealUnlock())} style={btnSciFi}>
          Unlock / vault — sweep + chime
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playGachaReveal())} style={{ ...btnSciFi, opacity: 0.85 }}>
          Mario level complete, sci-fi tone
        </button>
      </div>

      <h2 style={{ fontSize: 14, marginBottom: 10, opacity: 0.95 }}>8-bit achievement jingles</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}>
        <button type="button" onClick={() => onPlay(() => soundManager.playJingleMarioStyle())} style={btnStyle2}>
          Mario — level complete (short)
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playJingleMarioStyleGrand())} style={btnStyle2Grand}>
          Mario — grand (~2.8 s, two phrases)
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playJingleContraStyle())} style={btnStyle2}>
          Contra — stage clear (short)
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playJingleContraStyleGrand())} style={btnStyle2Grand}>
          Contra — grand (~2.6 s, extended fanfare)
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playJingleAchievement())} style={btnStyle2}>
          Achievement — ding-ding-ding-ding DAH (short)
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playJingleAchievementGrand())} style={btnStyle2Grand}>
          Achievement — grand (~2.4 s, two phrases)
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playJingleItemGet())} style={btnStyle2}>
          Item get — short sparkle
        </button>
        <button type="button" onClick={() => onPlay(() => soundManager.playJingleItemGetGrand())} style={btnStyle2Grand}>
          Item get — grand (~2.2 s, double ascent)
        </button>
      </div>

      <p style={{ fontSize: 12, marginTop: 32, opacity: 0.7 }}>
        Params live in <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px' }}>src/sound/SoundManager.ts</code> — <code>taDaVariantA/B/C</code>. Remove <code>?soundtest=1</code> to return to the app.
      </p>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 14,
  fontWeight: 600,
  color: '#0a1228',
  background: 'linear-gradient(180deg, #00d4ff 0%, #0099cc 100%)',
  border: '2px solid rgba(0,212,255,0.5)',
  borderRadius: 8,
  cursor: 'pointer',
};

const btnStyle2: React.CSSProperties = {
  ...btnStyle,
  background: 'linear-gradient(180deg, #88dd88 0%, #44aa66 100%)',
  borderColor: 'rgba(136,221,136,0.6)',
};

const btnStyle2Grand: React.CSSProperties = {
  ...btnStyle,
  background: 'linear-gradient(180deg, #ffcc66 0%, #dd9944 100%)',
  borderColor: 'rgba(255,200,100,0.6)',
};

const btnSciFi: React.CSSProperties = {
  ...btnStyle,
  background: 'linear-gradient(180deg, #aa88ff 0%, #6644cc 100%)',
  borderColor: 'rgba(170,136,255,0.6)',
};
