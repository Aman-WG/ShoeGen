# ShoeGen Migration Guide

This document is for the other Cursor instance working on the Qbit Shoe Generator project.

The goal is **not** to clone Aura Generator literally. The goal is to keep the proven template:

- shop entry experience
- iframe-based generator launch
- prompt input step
- dramatic processing step
- reveal / equip / retry flow
- dismissal safeguards and host-to-iframe bridge

while replacing:

- aura-specific visuals
- aura-specific copy
- aura rendering / aura modifier systems
- aura AI backend

with a new **shoe generation engine** and a new **shoe workshop visual theme**.

---

## Recommended Source Of Truth

Use the branch:

- `shop-and-aura-gen`

That branch is the best starting point because it already contains:

- the **shop-first flow** in `shop-app/`
- the **embedded generator app** in root `src/`
- the **dismissal flow** on both host and iframe sides
- the **coin gating** / wallet handoff pattern

---

## What To Keep

These are the parts worth preserving because they are template/system-level, not aura-specific.

### 1. Shop shell and iframe integration

Keep:

- `shop-app/src/App.jsx`
- `shop-app/src/components/AuraLabModal.jsx`
- `shop-app/src/hooks/useAvatarState.js`
- `shop-app/src/components/AvatarPreview.jsx`
- `shop-app/src/components/ItemGrid.jsx`
- `shop-app/src/components/CategoryTabs.jsx`
- `shop-app/src/styles.css`

Why:

- This already gives you the parent shop experience
- It already passes avatar data into the iframe
- It already handles close requests and coin balance handoff

For ShoeGen:

- rename the visible labels from aura concepts to shoe concepts
- keep the host/iframe architecture intact
- keep the wallet / coin flow intact

### 2. Generator flow orchestration

Keep the flow pattern from:

- `src/components/Layout.tsx`
- `src/hooks/useSynthesizer.ts`
- `src/constants/phases.ts`
- `src/constants/dialogue.ts`
- `src/hooks/useParentBridge.ts`
- `src/context/ParentBridgeContext.tsx`
- `src/components/ConfirmExitModal.tsx`
- `src/components/Console/*`

Why:

- These files are the backbone of the experience flow
- They already solve prompt -> processing -> reveal -> retry/equip
- They already solve dismissal behavior across phases

For ShoeGen:

- keep the phase machine
- keep the host bridge
- keep the prompt + reveal structure
- rewrite copy, labels, and timings only where needed

### 3. Sound / timing / stage choreography patterns

Keep as reusable patterns:

- `src/hooks/useSound.ts`
- `src/sound/SoundManager.ts`
- `src/components/IntroSplash.tsx`
- `src/components/Stage/Stage.tsx`

Why:

- Even if the actual sounds and visuals change, the orchestration pattern is useful
- You can swap assets and sound presets without throwing away the flow logic

### 4. Content moderation and safety

Keep:

- `src/utils/contentFilter.ts`

Why:

- The prompt field should still be moderated in ShoeGen
- The exact blocklist can be revised later, but the system should remain

---

## What To Replace Or Rewrite

These are highly aura-specific and should not be treated as core template files.

### 1. Aura engines

Replace or remove:

- `src/sainath-engine/*`
- `src/aura-engine/*`
- `shop-app/src/aura-engine/*`
- `src/components/Stage/SainathAuraCanvas.tsx`
- `src/components/Stage/AuraCanvas.tsx`
- `shop-app/src/components/AuraCanvas.jsx`
- `shop-app/src/components/AuraPreviewWidget.jsx`
- `src/components/AuraPreviewWidget.tsx`

Why:

- These are specific to aura rendering and aura data structures
- ShoeGen will use a different backend output and likely a different preview model

What to replace them with:

- a new `shoe-engine/` or `generator-engine/` folder
- a clear typed adapter layer for the new backend response
- a render layer for shoe preview / shoe metadata / applied result

### 2. Aura-specific reveal UI

Rewrite heavily:

- `src/components/Stage/RevealUnlock.tsx`
- `src/components/Stage/AuraModifierPanel.tsx`

Why:

- The current reveal is built around aura visuals and aura tweaking
- ShoeGen may still need a reveal panel, but the controls and presentation should be shoe-specific

Keep:

- the idea of a reveal beat
- the idea of delayed panel appearance
- the equip / retry interaction pattern

Replace:

- aura controls with shoe controls if needed
- character aura visuals with shoe reveal / try-on visuals

### 3. Aura-specific assets and copy

Replace:

- `public/sprites/*`
- `public/video/lab-bg.mp4`
- `public/sounds/*`
- `src/styles/aura-synth.css`
- `src/constants/dialogue.ts`

Why:

- These define the lab fantasy and aura identity
- ShoeGen needs a different world: workshop / forge / retro sneaker machine / style lab / drip station, etc.

Recommendation:

- keep the CSS file as the base layout if useful
- rename and progressively refactor it rather than doing a blind full rewrite on day one

---

## What To Remove Entirely In ShoeGen

These can be deleted once the new project has a stable replacement.

- `shop-reference/`
- `integration/`
- `public/sounds.zip`
- `public/sounds/SOUND_MAP.md`
- any old aura-only screenshots / backup sprites
- any experimental playground files not used by ShoeGen
- `src/AuraPlayground.tsx` if not needed

Notes:

- `shop-reference/` and `integration/` are handoff/reference material for this repo
- They are useful here, but should not be treated as product code in the new repo

---

## Recommended ShoeGen Structure

Use this as the target shape for the new repo:

```text
shoegen/
  shop-app/
    src/
      components/
      hooks/
      data/
      styles.css
  generator-app/
    src/
      components/
        Console/
        Stage/
        Reveal/
        Shared/
      constants/
      hooks/
      context/
      types/
      utils/
      sound/
      engine/
        backend/
        adapters/
        preview/
      styles/
  docs/
    SHOEGEN_PRODUCT_PLAN.md
    ENGINE_CONTRACT.md
```

If you want to move fast at first, you do **not** need to rename immediately.

Fastest path:

- keep `shop-app/` as-is
- keep root `src/` as the generator app temporarily
- once stable, rename root generator code into `generator-app/`

---

## Backend Engine Integration Strategy

The new shoe backend should not be wired straight into UI components.

Create a thin contract layer:

### 1. Backend client

Create something like:

- `generator-app/src/engine/backend/shoe-generator.ts`

This file should:

- call the new backend
- handle auth / API keys / fetch logic
- normalize errors

### 2. Response adapter

Create:

- `generator-app/src/engine/adapters/shoe-result-adapter.ts`

This should convert backend output into the UI model used by the reveal screen.

Do **not** let raw backend response shapes leak everywhere.

### 3. UI-facing result type

Define a clean result type, for example:

```ts
type ShoeGenerationResult = {
  previewImageUrl: string | null;
  shoeName?: string;
  shoePrompt: string;
  appliedItemId?: string;
  metadata?: Record<string, unknown>;
};
```

The UI should only care about this clean shape.

---

## How To Think About The Visual Revamp

Keep the template, change the fantasy.

### Keep

- intro splash
- staged build-up
- prompt moment
- processing suspense
- reveal payoff
- equip / retry CTA pattern

### Change

- lab background -> shoe workshop / style forge / sneaker machine
- scanner / claws -> robotic cobbler arms / sole press / stitching machine / fitting rig
- aura reveal -> shoe reveal / fitted-on-avatar reveal / product card reveal
- aura modifiers -> shoe customization / material / lace / glow / sole / trim controls if needed

Rule:

- preserve the emotional rhythm
- do not preserve aura-specific metaphors unless they still make sense

---

## Recommended Migration Order

### Phase 1: Bootstrap

1. Start from `shop-and-aura-gen`
2. Copy `shop-app/`
3. Copy generator app code from root `src/`
4. Remove handoff-only folders:
   - `shop-reference/`
   - `integration/`

### Phase 2: Rename and re-theme

1. Replace copy mentioning aura, lab, synth, generator where needed
2. Swap visual assets
3. Update dialogue and splash text
4. Keep phase logic intact

### Phase 3: Replace engine

1. Remove aura-specific engine files
2. Add the new shoe backend client
3. Add adapter layer
4. Update reveal to consume shoe result data

### Phase 4: Polish

1. Update sound design
2. Update reveal choreography
3. Tune dismissal flow copy
4. Revisit coin gating and economy copy for shoes

---

## Hard Rules For The Other Cursor Instance

1. Do not rewrite everything from scratch.
2. Preserve the host/iframe communication model.
3. Preserve the dismissal flow logic.
4. Keep backend integration isolated from UI.
5. Replace aura-specific rendering systems, not the flow skeleton.
6. Prefer adapting existing files before creating parallel duplicate systems.
7. Delete reference-only folders from the new repo once the needed code is copied.

---

## Quick File Decision Matrix

### Keep directly

- `shop-app/src/components/AuraLabModal.jsx`
- `src/components/Layout.tsx`
- `src/hooks/useParentBridge.ts`
- `src/components/ConfirmExitModal.tsx`
- `src/components/Console/*`
- `src/hooks/useSynthesizer.ts`
- `src/utils/contentFilter.ts`

### Keep but rename / re-theme

- `src/components/IntroSplash.tsx`
- `src/components/Stage/Stage.tsx`
- `src/styles/aura-synth.css`
- `src/constants/dialogue.ts`
- `public/video/lab-bg.mp4`
- `public/sprites/*`
- `public/sounds/*`

### Replace completely

- `src/sainath-engine/*`
- `src/aura-engine/*`
- `shop-app/src/aura-engine/*`
- `src/components/Stage/AuraModifierPanel.tsx`
- `src/components/Stage/RevealUnlock.tsx`
- aura-specific preview rendering files

### Remove from new repo

- `shop-reference/`
- `integration/`
- `src/AuraPlayground.tsx` if unused
- any stale aura-only documentation/assets not needed for ShoeGen

---

## Final Recommendation

For ShoeGen, think in layers:

- **Layer 1: Shop shell**
  Handles inventory, wallet, avatar, iframe open/close.

- **Layer 2: Generator experience shell**
  Handles prompt, suspense, reveal, retry, equip, dismissal flow.

- **Layer 3: Generator engine**
  Talks to the new backend and adapts results into UI-safe data.

- **Layer 4: Theme layer**
  Assets, sounds, copy, workshop visuals, motion flavor.

If those layers stay separated, ShoeGen can move quickly without turning into spaghetti.
