# Nailing the Ta-Da reveal sound

**Goal:** A literal “Ta” (short) + “Daaaaaaaa” (long) for the gacha reveal, with minimal back-and-forth.

## Process

1. **Open the sound test:** Run the app and add `?soundtest=1` to the URL (e.g. `http://localhost:5173/?soundtest=1`).

2. **Click the variants:** You’ll see **A**, **B**, **C** (different Ta/Da tunings) and **Current full reveal**. Click each and listen.

3. **Give one-line feedback,** for example:
   - “A is closest but the Da should be longer”
   - “B, but make the Ta punchier”
   - “C’s pitch is right, add a bit more rise on the Da”

4. **I adjust** the params in `src/sound/SoundManager.ts` (`taDaVariantA`, `taDaVariantB`, `taDaVariantC`) and, if you’ve chosen one, wire that variant into the real reveal (`playShatterReveal`). You reload `?soundtest=1` and try again.

## Where to edit

- **Ta (short note):** `ta` in each variant — `attack`, `sustain`, `release` (index 3,4,5), `frequency` (index 2). Lower freq = darker; shorter sustain = snappier.
- **Da (long note):** `da` in each variant — `sustain` (index 4) = length of “Daaaa”; `frequency` (index 2) and `slide`/`pitchJump` (index 8,10) = pitch and slight rise.
- **Gap between Ta and Da:** `daMs` in each variant — delay in ms before the Da plays (e.g. 95 = Da starts 95 ms after Ta).

## After we nail it

Once you say e.g. “Use A,” we set `playShatterReveal()` to call `playTaDaVariantA()` (and optionally a light boom after). You can remove `?soundtest=1` or keep it for future tuning.
