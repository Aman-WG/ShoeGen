import { zzfx, ZZFX } from 'zzfx';

type ZzfxParams = (number | undefined)[];

// ─── Shoe Forge sound map (moment → intent) ────────────────────────
// intro       — Distinct logo reveal: deep whoosh + mechanical lock + ignition chime.
// start forge — Heavy machinery; forge booting (initiate).
// prompt/UI   — Same as Aura: hover, select, keystroke, typewriter (consistency).
// processing  — Heavy machinery: industrial drone + steam/hydraulic layer + metallic pulse + beeping crescendo.
// reveal      — Beeping crescendo pays off: heavy impact + shimmer + sparkle (3-layer).
// equip       — Triumphant confirmation (equip + chime).
// pressClose  — Steam press closes (heavy thud).
// revealOpen  — Reveal chest opens (bright burst).

// ─── ZzFX Parameter Index Reference ────────────────────────────────
// [volume, randomness, frequency, attack, sustain, release, shape,
//  shapeCurve, slide, deltaSlide, pitchJump, pitchJumpTime, repeatTime,
//  noise, modulation, bitCrush, delay, sustainVolume, decay, tremolo]
//
// Shapes: 0=sin  1=tri  2=saw  3=tan  4=noise

const SFX = {
  // ── UI Feedback ──────────────────────────────────────────────────

  hover: [, , 1400, .003, .01, .01, 1, , 18, , , , , , , , , .5] as ZzfxParams,

  select: [, , 520, .01, .07, .12, 2, 1.8, , -5, -50, .03, , , , , .01, .65] as ZzfxParams,

  keystroke: [.04, , 2400, .001, .005, .008, 4, , , , , , , , , , , .3] as ZzfxParams,

  typewriterTick: [.07, .02, 680, .001, .02, .025, 1, , -12, , , , , , , , , .65] as ZzfxParams,

  // ── Flow Triggers (shoe forge: heavier, mechanical) ───────────────

  initiate: [.58, .03, 92, .02, .32, .45, 2, 1.8, 18, .8, 180, .16, , , .12, 18, , .48, .06] as ZzfxParams,

  glitch: [.38, .08, 160, .01, .1, .22, 3, 2, 8, , -220, .01, .03, .45, 22, .02, , .3, .04, .14] as ZzfxParams,

  // ── Machine: industrial drone + steam/hydraulic layer + pulse ──────

  laserZap: [.22, .04, 180, .03, .5, .2, 4, , -25, , , , , .18, 35, , , .5] as ZzfxParams,

  laserBeam: [.1, .02, 95, .12, .9, .14, 2, 2, -8, , , , , .12, 28, , , , , .35] as ZzfxParams,

  machineDrone: [.14, .01, 52, .2, 1.0, .18, 2, 2.4, , , , , , , 14, , , , , .42] as ZzfxParams,

  machinePulse: [.18, .06, 140, , .06, .1, 2, 1.6, -35, , -90, .025, , .28] as ZzfxParams,

  tensionSub: [.15, , 38, .14, .85, .12, 0, , , , , , , , , , , , , .5] as ZzfxParams,

  // ── Gacha Reveal: literal "Ta" (short) + "Daaaaaaaa" (long) — tune via ?soundtest=1 ─

  taShort: [.58, .02, 400, .004, .05, .1, 0, 1.2, , , , , , , , , , .75] as ZzfxParams,

  daLong: [.52, , 420, .02, .7, .4, 0, 1.1, 12, , 40, .08, , , , , , .78] as ZzfxParams,

  // Variant A: Ta 400 → Da 420 (step up), Da ~0.7s
  // Variant B: Ta 350 → Da 440 (bigger step), Da longer
  // Variant C: Ta 380 → Da 380 (same pitch), Da bright
  taDaVariantA: { ta: [.58, .02, 400, .004, .05, .1, 0, 1.2, , , , , , , , , , .75] as ZzfxParams, da: [.52, , 420, .02, .7, .4, 0, 1.1, 12, , 40, .08, , , , , , .78] as ZzfxParams, daMs: 95 },
  taDaVariantB: { ta: [.6, .02, 350, .005, .06, .12, 0, 1.2, , , , , , , , , , .75] as ZzfxParams, da: [.54, , 440, .018, .88, .45, 0, 1.1, 15, , 50, .1, , , , , , .8] as ZzfxParams, daMs: 110 },
  taDaVariantC: { ta: [.56, .02, 380, .004, .05, .1, 1, 1.3, , , , , , , , , , .74] as ZzfxParams, da: [.5, , 380, .022, .72, .42, 0, 1.1, 25, , 60, .12, , , , , , .76] as ZzfxParams, daMs: 100 },

  victoryHit: [.65, .03, 220, .002, .08, .22, 2, 1.6, , , 80, .04, , , , , , .7] as ZzfxParams,

  fanfareBlast: [.55, .02, 260, .008, .12, .2, 2, 1.5, 15, , 120, .06, , , , , , .72] as ZzfxParams,

  victoryChord: [.5, .02, 320, .02, .35, .5, 1, 1.4, 8, , 100, .1, , , , , , .68] as ZzfxParams,

  victoryBoom: [.7, .04, 65, .005, .15, .45, 2, 1.8, , , -60, .03, , .12, , , , .5, .06] as ZzfxParams,

  // ── Equip Confirmation ───────────────────────────────────────────

  equip: [.5, , 480, .02, .12, .2, 0, 1.2, , , 340, .07, , , , , , .7] as ZzfxParams,

  equipChime: [.32, , 860, .01, .08, .3, 0, , , , 195, .06, , , , , .05, .5] as ZzfxParams,

  // ── Intro: distinct logo reveal (whoosh → mechanical lock → ignition chime) ─

  introWhoosh: [.38, .02, 42, .12, .32, .6, 0, , 90, 2.2, , , , .18, , , , .28, .1] as ZzfxParams,

  introHit: [.58, .04, 78, , .1, .48, 4, 1.8, , , -40, .03, , .42, , , , .2, .06] as ZzfxParams,

  introChime: [.28, , 640, .01, .06, .28, 0, 1.2, , , 320, .06, , , , , , .55] as ZzfxParams,

  // ── Optional: steam press close / reveal open (for sprite integration) ─

  pressClose: [.5, .03, 55, , .08, .35, 4, 1.8, , , -80, .02, , .5, , , .02, .12, .04] as ZzfxParams,

  revealOpen: [.4, , 620, .02, .12, .35, 0, 1.2, , , 400, .08, , , , , , .55] as ZzfxParams,

  // ── Gacha reveal: Mario level-complete melody, sci-fi flavour ─

  sciFiNote: [.48, .02, 330, .012, .14, .2, 0, 1.2, 22, , 50, .06, , .04, 6, , , .72] as ZzfxParams,

  sciFiNoteLong: [.44, , 392, .02, .38, .32, 0, 1.15, 15, , 40, .1, , .03, 5, , , .74] as ZzfxParams,

  // ── Sci-fi celebratory (fanfare, mission complete, discovery, victory sting) ─

  sciFiFanfare: [.5, .02, 400, .008, .16, .22, 0, 1.25, 28, , 60, .05, , .05, 8, , , .74] as ZzfxParams,

  sciFiFanfareLong: [.46, , 520, .015, .35, .35, 0, 1.2, 20, , 80, .12, , .04, 6, , , .76] as ZzfxParams,

  sciFiSting: [.52, .03, 660, .003, .06, .14, 1, 1.4, , , 120, .04, , , , , , .7] as ZzfxParams,

  /** Extended crescendo tone: sustained note with upward slide (swell). */
  sciFiStingCrescendo: [.48, .02, 880, .02, .5, .4, 0, 1.15, 80, 2, 200, .2, , .04, 6, , , .78] as ZzfxParams,

  sciFiShimmer: [.4, .02, 580, .02, .18, .28, 0, 1.15, 35, , 90, .08, , .06, 10, , , .7] as ZzfxParams,

  sciFiResolve: [.48, , 740, .025, .45, .4, 0, 1.1, 15, , 100, .15, , .03, 4, , , .75] as ZzfxParams,

  sciFiSweep: [.38, .02, 280, .04, .25, .35, 0, 1, 120, 4, , , , .08, 15, , , .68] as ZzfxParams,

  // ── Star 🌟 (exact params from CodePen BaowKzv — zzfx(...[,,80,.3,.4,.7,2,.1,-0.73,3.42,-430,.09,.17,,,,.19]) ─
  star: [,, 80, .3, .4, .7, 2, .1, -0.73, 3.42, -430, .09, .17, , , , , .19] as ZzfxParams,

  // ── 8-bit achievement jingles (Mario / Contra style) — melodious, chip-tone ─

  chipNote: [.42, .02, 330, .005, .08, .12, 1, 1.3, , , , , , , , , , .7] as ZzfxParams,

  chipNoteLong: [.38, , 392, .01, .25, .2, 1, 1.2, , , , , , , , , , .72] as ZzfxParams,
} as const;

// C major scale (Hz) for 8-bit jingles
const NOTE = {
  C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, B4: 494,
  C5: 523, D5: 587, E5: 659, F5: 698, G5: 784, A5: 880, B5: 988,
  C6: 1047, D6: 1175, E6: 1319, G6: 1568, C7: 2093,
};

class SoundManager {
  private _enabled = true;
  private _machineInterval: ReturnType<typeof setInterval> | null = null;
  private _droneSource: AudioBufferSourceNode | null = null;
  private _laserSource: AudioBufferSourceNode | null = null;
  private _tensionActive = false;
  private _tensionTimeout: ReturnType<typeof setTimeout> | null = null;
  private _tensionSubSource: AudioBufferSourceNode | null = null;
  private _lastTickTime = 0;

  get enabled() {
    return this._enabled;
  }

  setEnabled(on: boolean) {
    this._enabled = on;
    if (!on) {
      this.stopMachineLoading();
      this.stopLaser();
      this.stopTension();
    }
  }

  /**
   * Resume the zzfx AudioContext (required after user gesture in modern browsers).
   * Returns a Promise so callers can wait before playing: resumeAudioContext().then(() => play()).
   */
  resumeAudioContext(): Promise<void> {
    try {
      const ctx = (ZZFX as { audioContext?: AudioContext }).audioContext;
      if (ctx?.state === 'suspended') {
        return ctx.resume() as Promise<void>;
      }
    } catch {
      /* ignore */
    }
    return Promise.resolve();
  }

  private fire(params: ZzfxParams) {
    if (!this._enabled) return;
    try {
      zzfx(...params);
    } catch (e) {
      if (typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn('zzfx play failed', e);
      }
    }
  }

  /** Fire a param array with frequency overridden (index 2) for pitch variation. */
  private fireAtFreq(base: ZzfxParams, frequency: number) {
    const p = [...base] as ZzfxParams;
    p[2] = frequency;
    this.fire(p);
  }

  // ── Public API ─────────────────────────────────────────────────

  playHover() {
    this.fire(SFX.hover);
  }

  playSelectElement() {
    this.fire(SFX.select);
  }

  playKeystroke() {
    this.fire(SFX.keystroke);
  }

  /** Tiny per-character tick, throttled to ~60ms so rapid typing doesn't stack. */
  playTypewriterTick() {
    if (!this._enabled) return;
    const now = performance.now();
    if (now - this._lastTickTime < 60) return;
    this._lastTickTime = now;
    this.fire(SFX.typewriterTick);
  }

  playInitiate() {
    this.fire(SFX.initiate);
  }

  playGlitch() {
    this.fire(SFX.glitch);
  }

  // ── Laser (claw fire) ────────────────────────────────────────

  /** One-shot laser zap — plays once when claws fire a single burst. */
  playLaserBurst() {
    this.fire(SFX.laserZap);
  }

  /** Continuous looping laser beam for the processing-phase claw loop. */
  startLaser() {
    if (!this._enabled) return;
    this.stopLaser();
    try {
      const samples = ZZFX.buildSamples(...SFX.laserBeam);
      this._laserSource = ZZFX.playSamples([samples], 1, 1, 0, true);
    } catch { /* fallback: silent */ }
  }

  stopLaser() {
    if (this._laserSource) {
      try { this._laserSource.stop(); } catch { /* already stopped */ }
      this._laserSource = null;
    }
  }

  // ── Machine Processing ────────────────────────────────────────

  /**
   * Starts a layered machine processing sound:
   * continuous low drone + periodic rhythmic pulses.
   * Call stopMachineLoading() or the returned cleanup fn to stop.
   */
  playMachineLoading(): () => void {
    if (!this._enabled) return () => {};

    this.stopMachineLoading();

    try {
      const droneSamples = ZZFX.buildSamples(...SFX.machineDrone);
      this._droneSource = ZZFX.playSamples([droneSamples], 1, 1, 0, true);
    } catch {
      /* fallback: no drone */
    }

    const pulse = () => this.fire(SFX.machinePulse);
    pulse();
    this._machineInterval = setInterval(pulse, 650);

    return () => this.stopMachineLoading();
  }

  stopMachineLoading() {
    if (this._droneSource) {
      try { this._droneSource.stop(); } catch { /* already stopped */ }
      this._droneSource = null;
    }
    if (this._machineInterval) {
      clearInterval(this._machineInterval);
      this._machineInterval = null;
    }
  }

  // ── Tension Build (screen shake phase) ────────────────────────

  /**
   * Escalating alarm that builds tension over the processing phase:
   * - A looped sub-bass throb for physical weight
   * - Alarm pulses that start slow & low-pitched, then accelerate
   *   and rise in frequency toward a critical climax
   */
  startTension(): () => void {
    if (!this._enabled) return () => {};
    this.stopTension();

    this._tensionActive = true;
    let pitch = 0;
    let interval = 900;

    try {
      const subSamples = ZZFX.buildSamples(...SFX.tensionSub);
      this._tensionSubSource = ZZFX.playSamples([subSamples], 1, 1, 0, true);
    } catch { /* silent fallback */ }

    const tick = () => {
      if (!this._tensionActive) return;
      pitch += 22;
      interval = Math.max(100, interval - 55);
      // Mechanical beep (saw + noise) rising to crescendo for gacha reveal
      this.fire([.2, .04, 280 + pitch, .003, .035, .09, 2, 1.4, , , , , , .08, 12, , , .55]);
      this._tensionTimeout = setTimeout(tick, interval);
    };

    tick();
    return () => this.stopTension();
  }

  stopTension() {
    this._tensionActive = false;
    if (this._tensionTimeout) {
      clearTimeout(this._tensionTimeout);
      this._tensionTimeout = null;
    }
    if (this._tensionSubSource) {
      try { this._tensionSubSource.stop(); } catch { /* already stopped */ }
      this._tensionSubSource = null;
    }
  }

  // ── Reveal / Equip / Intro ────────────────────────────────────

  /** Literal "Ta" (short) + "Daaaaaaaa" (long). For tuning: play from ?soundtest=1, pick A/B/C, then e.g. "B but Da longer". */
  playTaDaVariantA() {
    if (!this._enabled) return;
    const v = SFX.taDaVariantA;
    this.fire(v.ta);
    setTimeout(() => this.fire(v.da), v.daMs);
  }

  playTaDaVariantB() {
    if (!this._enabled) return;
    const v = SFX.taDaVariantB;
    this.fire(v.ta);
    setTimeout(() => this.fire(v.da), v.daMs);
  }

  playTaDaVariantC() {
    if (!this._enabled) return;
    const v = SFX.taDaVariantC;
    this.fire(v.ta);
    setTimeout(() => this.fire(v.da), v.daMs);
  }

  /** Mario-style "level complete": rising arpeggio C–E–G–C5, then tag E5–G5–C6. */
  playJingleMarioStyle() {
    if (!this._enabled) return;
    const n = NOTE;
    const s = (ms: number, f: number, long = false) =>
      setTimeout(() => this.fireAtFreq(long ? SFX.chipNoteLong : SFX.chipNote, f), ms);
    s(0, n.C4); s(120, n.E4); s(240, n.G4); s(360, n.C5); s(520, n.E5); s(640, n.G5); s(760, n.C6, true);
  }

  /** Mario-style grand: longer, two phrases + resolution (~2.8 s). */
  playJingleMarioStyleGrand() {
    if (!this._enabled) return;
    const n = NOTE;
    const s = (ms: number, f: number, long = false) =>
      setTimeout(() => this.fireAtFreq(long ? SFX.chipNoteLong : SFX.chipNote, f), ms);
    s(0, n.C4); s(180, n.E4); s(360, n.G4); s(540, n.C5);
    s(760, n.E5); s(940, n.G5); s(1120, n.C6);
    s(1380, n.C5); s(1560, n.E5); s(1740, n.G5); s(1920, n.C6, true);
  }

  /** Contra-style "stage clear": short triumphant fanfare. */
  playJingleContraStyle() {
    if (!this._enabled) return;
    const n = NOTE;
    const s = (ms: number, f: number, long = false) =>
      setTimeout(() => this.fireAtFreq(long ? SFX.chipNoteLong : SFX.chipNote, f), ms);
    s(0, n.G4); s(140, n.C5); s(280, n.E5); s(420, n.G5); s(600, n.C6, true);
  }

  /** Contra-style grand: extended fanfare with build and resolution (~2.6 s). */
  playJingleContraStyleGrand() {
    if (!this._enabled) return;
    const n = NOTE;
    const s = (ms: number, f: number, long = false) =>
      setTimeout(() => this.fireAtFreq(long ? SFX.chipNoteLong : SFX.chipNote, f), ms);
    s(0, n.G4); s(180, n.C5); s(360, n.E5); s(540, n.G5);
    s(760, n.C5); s(940, n.E5); s(1120, n.G5); s(1300, n.C6);
    s(1580, n.E6, true);
  }

  /** Classic achievement: ding-ding-ding-ding DAH (4 short + 1 long). */
  playJingleAchievement() {
    if (!this._enabled) return;
    const n = NOTE;
    const s = (ms: number, f: number, long = false) =>
      setTimeout(() => this.fireAtFreq(long ? SFX.chipNoteLong : SFX.chipNote, f), ms);
    s(0, n.E4); s(160, n.G4); s(320, n.B4); s(480, n.E5); s(640, n.G5, true);
  }

  /** Achievement grand: two phrases, bigger resolution (~2.4 s). */
  playJingleAchievementGrand() {
    if (!this._enabled) return;
    const n = NOTE;
    const s = (ms: number, f: number, long = false) =>
      setTimeout(() => this.fireAtFreq(long ? SFX.chipNoteLong : SFX.chipNote, f), ms);
    s(0, n.E4); s(180, n.G4); s(360, n.B4); s(540, n.E5); s(720, n.G5, true);
    s(1100, n.E5); s(1280, n.G5); s(1460, n.B5); s(1640, n.E6); s(1820, n.G5, true);
  }

  /** Short "item get" / power-up (ascending sparkle). */
  playJingleItemGet() {
    if (!this._enabled) return;
    const n = NOTE;
    const s = (ms: number, f: number) => setTimeout(() => this.fireAtFreq(SFX.chipNote, f), ms);
    s(0, n.C5); s(80, n.E5); s(160, n.G5); s(240, n.C6);
  }

  /** Item get grand: longer ascent, second higher run, held finish (~2.2 s). Chip tone for sound test. */
  playJingleItemGetGrand() {
    if (!this._enabled) return;
    const n = NOTE;
    const s = (ms: number, f: number, long = false) =>
      setTimeout(() => this.fireAtFreq(long ? SFX.chipNoteLong : SFX.chipNote, f), ms);
    s(0, n.C5); s(140, n.E5); s(280, n.G5); s(420, n.C6);
    s(640, n.E5); s(780, n.G5); s(920, n.C6); s(1060, n.E6);
    s(1320, n.G6, true);
  }

  /**
   * Gacha reveal: Mario level-complete melody (rising arpeggio, two phrases) in sci-fi flavour.
   */
  playGachaReveal() {
    if (!this._enabled) return;
    const n = NOTE;
    const s = (ms: number, f: number, long = false) =>
      setTimeout(() => this.fireAtFreq(long ? SFX.sciFiNoteLong : SFX.sciFiNote, f), ms);
    s(0, n.C4); s(180, n.E4); s(360, n.G4); s(540, n.C5);
    s(760, n.E5); s(940, n.G5); s(1120, n.C6);
    s(1380, n.C5); s(1560, n.E5); s(1740, n.G5); s(1920, n.C6, true);
  }

  /** Sci-fi fanfare: triumphant rising phrase (G B D G5) then resolution (B5 D6 G5 held). */
  playRevealSciFiFanfare() {
    if (!this._enabled) return;
    const n = NOTE;
    const s = (ms: number, f: number, long = false) =>
      setTimeout(() => this.fireAtFreq(long ? SFX.sciFiFanfareLong : SFX.sciFiFanfare, f), ms);
    s(0, n.G4); s(160, n.B4); s(320, n.D5); s(480, n.G5);
    s(720, n.B5); s(900, n.D6); s(1080, n.G5, true);
  }

  /** Mission complete: short ship-computer style ding-ding-DAH. */
  playRevealMissionComplete() {
    if (!this._enabled) return;
    const n = NOTE;
    const s = (ms: number, f: number, long = false) =>
      setTimeout(() => this.fireAtFreq(long ? SFX.sciFiFanfareLong : SFX.sciFiSting, f), ms);
    s(0, n.E5); s(140, n.G5); s(320, n.C6, true);
  }

  /** Discovery: shimmer rise then big resolve (like finding a rare drop). */
  playRevealDiscovery() {
    if (!this._enabled) return;
    const n = NOTE;
    const s = (ms: number, f: number, long = false) =>
      setTimeout(() => this.fireAtFreq(long ? SFX.sciFiResolve : SFX.sciFiShimmer, f), ms);
    s(0, n.C5); s(200, n.E5); s(400, n.G5); s(600, n.C6);
    s(880, n.E6, true);
  }

  /** Victory sting 1: quick 3-note punch (short, punchy). */
  playRevealVictorySting() {
    if (!this._enabled) return;
    const n = NOTE;
    const s = (ms: number, f: number) =>
      setTimeout(() => this.fireAtFreq(SFX.sciFiSting, f), ms);
    s(0, n.G5); s(120, n.C6); s(280, n.E6);
  }

  /** Victory sting 2: 4 notes, all same melodious sting tone — more celebratory, slightly longer. */
  playRevealVictorySting2() {
    if (!this._enabled) return;
    const n = NOTE;
    const s = (ms: number, f: number) =>
      setTimeout(() => this.fireAtFreq(SFX.sciFiSting, f), ms);
    s(0, n.G5); s(140, n.C6); s(300, n.E6); s(480, n.G6);
  }

  /** Victory sting 3: 5-note build, all melodious sting — longer phrase, same tone throughout. */
  playRevealVictorySting3() {
    if (!this._enabled) return;
    const n = NOTE;
    const s = (ms: number, f: number) =>
      setTimeout(() => this.fireAtFreq(SFX.sciFiSting, f), ms);
    s(0, n.G5); s(130, n.A5); s(270, n.C6); s(420, n.E6); s(580, n.G6);
  }

  /** Victory sting 4: 6-note rise, all melodious sting — full phrase, same tone throughout. */
  playRevealVictorySting4() {
    if (!this._enabled) return;
    const n = NOTE;
    const s = (ms: number, f: number) =>
      setTimeout(() => this.fireAtFreq(SFX.sciFiSting, f), ms);
    s(0, n.G5); s(140, n.B5); s(300, n.D6); s(480, n.E6); s(680, n.G6); s(900, n.C6);
  }

  /** Star (🌟) — bright twinkle from CodePen-style zzfx sound board. */
  playStar() {
    if (!this._enabled) return;
    this.fire(SFX.star);
  }

  /** Unlock / vault open: low sweep up then bright chime. */
  playRevealUnlock() {
    if (!this._enabled) return;
    this.fire(SFX.sciFiSweep);
    setTimeout(() => this.fireAtFreq(SFX.sciFiResolve, NOTE.C6), 420);
  }

  /** Gacha reveal: star sound (CodePen BaowKzv 🌟). */
  playShatterReveal() {
    if (!this._enabled) return;
    this.playStar();
  }

  /**
   * Triumphant ascending equip confirmation — double chime.
   */
  playEquip() {
    if (!this._enabled) return;
    this.fire(SFX.equip);
    setTimeout(() => this.fire(SFX.equipChime), 120);
  }

  /**
   * Distinct logo reveal: deep whoosh → mechanical lock → ignition chime.
   */
  playIntroWhoosh() {
    if (!this._enabled) return;
    this.fire(SFX.introWhoosh);
    setTimeout(() => this.fire(SFX.introHit), 320);
    setTimeout(() => this.fire(SFX.introChime), 520);
  }

  /** One-shot: steam press closes (heavy thud). Call when Forge starts / press closes. */
  playPressClose() {
    if (!this._enabled) return;
    this.fire(SFX.pressClose);
  }

  /** One-shot: reveal chest opens (bright burst). Call when reveal phase starts. */
  playRevealOpen() {
    if (!this._enabled) return;
    this.fire(SFX.revealOpen);
  }

  /** Kills every looping / scheduled sound at once. */
  stopAll() {
    this.stopMachineLoading();
    this.stopLaser();
    this.stopTension();
  }
}

export const soundManager = new SoundManager();
