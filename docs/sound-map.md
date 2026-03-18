# Shoe Forge — Sound Map

Short reference for zzfx sound design. Tuned for a heavier, more mechanical “forge” feel while keeping consistency with the Aura generator flow.

| Moment | Intent | SoundManager method(s) |
|--------|--------|------------------------|
| **Intro** | Distinct logo reveal: whoosh → mechanical lock → ignition chime | `playIntroWhoosh()` (3-part) |
| **Start forge** | Heavy machinery; forge booting | `playInitiate()` |
| **Prompt / UI** | Same as Aura (consistency): hover, select, keystroke, typewriter | `playGlitch()` on Forge; UI methods unchanged |
| **Processing** | Heavy machinery: drone + steam/hydraulic layer + metallic pulse + beeping crescendo | `startMachine()`, `startLaser()` (steam layer), `startTension()` (mechanical beeps); stop on reveal |
| **Reveal** | Victory fanfare: bold horn blasts (rising phrase) → chord → boom (battle won / town hall style) | `playShatterReveal()` (~2.2 s, martial, no sparkles) |
| **Equip** | Triumphant, clear confirmation | `playEquip()` (equip + chime) |
| **Press close** (optional) | Heavy thud when steam press closes | `playPressClose()` |
| **Reveal open** (optional) | Bright burst when reveal chest opens | `playRevealOpen()` |

Params live in `src/sound/SoundManager.ts`. Adjust the `SFX` object entries to tweak character (e.g. more bass, brighter reveal).
