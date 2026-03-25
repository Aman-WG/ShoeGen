# ShoeGen — Catchup Document

## What This Is
A GenAI shoe generator for middle school students on the Wayground platform. Students describe custom kicks, the AI generates them, and they equip the shoes to their Q-bit avatar. Runs as an iframe inside the Q-bit Shop.

**Sister project**: Aura Generator — same architecture, different content. Changes are often ported between the two.

## Architecture
- React 19 + TypeScript + Vite
- Framer Motion for animations and layout transitions
- ZzFX for procedural sound effects
- postMessage API for iframe ↔ shop communication
- Portkey gateway → LLM for shoe generation

## User Flow (Current State)

| Step | What Happens |
|------|-------------|
| **INTRO** | "SHOE FORGE" splash screen with glitch effect |
| **GREETING** | Typewriter: "Q-BIT scan complete. Shoe game: LACKING." → "Firing up the forge..." |
| **STYLE SELECT** | Auto-transitions to PROMPT. 5 style chips with icons: High-top, Mid-top, Pointy high, Pointy mid, Strap shoes |
| **PROMPT** | After picking a style, prompt section slides in (progressive reveal). Input field + 3 preset chips + FORGE button with 10,000 coin cost pill |
| **SPEND CONFIRM** | Center-screen modal: "Spend 10,000 coins? Coins once spent cannot be refunded." |
| **PROCESSING** | 10s generation with camera zoom choreography (5 POIs), screen shake, white flashes. 25 cycling quirky lines every 2s |
| **REVEAL** | Gacha moment — shoe silhouette → reveal. Yellow title shows shoe name. Subtext: "These [awesome/dazzling/fire] kicks have been saved to your shoe inventory." |
| **EQUIP** | "Equip Now" CTA sends shoe to shop and closes |

## Key Decisions Made (March 2026)

**Flow simplification:**
- Removed "Start The Forge" initiate button — auto-transitions greeting → style selection
- Coin charge moved to FORGE button (10,000 coins, was 2,000)
- Spend confirmation modal before generation
- No retry flow — re-enter from shop for another shoe
- Progressive reveal form — style first, prompt appears after

**Reveal screen:**
- "Equip Now" single CTA
- Shoe name as large yellow celebration title (replaced floating name tag)
- Random inventory subtext (one per session)
- Dim overlay reduced 10% for video bleed-through

**UI polish:**
- Preset chips populate text field (not trigger generation)
- Prompt field breathing glow animation
- Console layout animation disabled during IDLE/PROCESSING (prevents jitter)
- 12px consistent gaps throughout
- Error messages inline below CTA

## Key Files

| File | Purpose |
|------|---------|
| `src/components/Layout.tsx` | Main orchestrator — phases, state, coin logic, spend modal |
| `src/components/Console/InteractionArea.tsx` | Progressive reveal: style chips → prompt + FORGE |
| `src/components/Stage/ShoeReveal.tsx` | Gacha reveal, celebration title, equip CTA |
| `src/components/SpendConfirmModal.tsx` | Coin spend confirmation |
| `src/constants/dialogue.ts` | Phase dialogue + 25 PROCESSING_LINES |
| `src/hooks/useSynthesizer.ts` | Central state store |
| `src/hooks/useParentBridge.ts` | iframe ↔ shop bridge |
| `src/engine/backend/shoe-generator.ts` | LLM shoe generation |
| `src/styles/shoe-workshop.css` | All CSS |
| `public/icons/shoe-styles/` | 5 shoe style PNG icons from Figma |

## Message Protocol

**ShoeGen → Shop:** `shoegen:ready`, `shoegen:equipped`, `shoegen:save`, `shoegen:phase-change`, `shoegen:close`, `shoegen:spend-coins`

**Shop → ShoeGen:** `qbit:avatar-data`, `qbit:coin-balance`, `qbit:request-close`

## 5 Shoe Styles
High-top, Mid-top, Pointy high, Pointy mid, Strap shoes — white PNGs CSS-filtered to cyan at 80% opacity.

## Figma References
- Style selection (step 1): `node-id=639-6494` in file `2AFmTIqJuWzFhYWetiluf3`
- Prompt + forge (step 2): `node-id=644-6676` in same file

## Git
- **Repo**: https://github.com/Aman-WG/ShoeGen
- **Branch**: `changes_march24`
