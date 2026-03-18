# Shoe Modifier Feasibility (non-P0)

Optional one-pager: where modifiers could appear, what the API would need, and how they fit the current flow. No implementation in P0.

---

## Current state

- **ShoeCustomizePanel** ([src/components/Stage/ShoeCustomizePanel.tsx](src/components/Stage/ShoeCustomizePanel.tsx)) already exists: material, sole, color shift, glow. It is shown on the **reveal** screen (left panel) when `onCustomize` is provided.
- **ShoeCustomizations** (material, sole, glow, colorShift) are applied in UI only; **Layout**’s `handleCustomize` is a no-op and customizations are not sent to the generation API or to the parent shop.
- **ShoeModifiers** in [src/engine/types.ts](src/engine/types.ts) (material, sole, laces, glow, colorOverride) are not part of `ShoeGenerationRequest` today; generation uses only `prompt` and `style`.

---

## Where modifiers could appear (UX)

1. **Post-reveal only** — User generates a shoe, then on the reveal screen adjusts material/sole/glow/color. No re-generation; modifiers would affect a client-side preview (e.g. filters/overlays) or be stored as metadata and applied when the shoe is rendered on the avatar.
2. **Pre-generation** — User picks style + prompt + optional modifiers (e.g. “metallic”, “chunky sole”) before Forge. Generation API would need to accept these and return a result that respects them (if the backend supports it).
3. **Hybrid** — Default generation; on reveal, user tweaks modifiers and either “Apply” (preview only) or “Re-forge with these modifiers” (new API call with same prompt + style + modifiers).

---

## What the API would need

- If **post-reveal (preview only)**: no API change; modifiers drive local preview/avatar rendering only. Backend only needs to store optional metadata (e.g. `modifiers: { material, sole, glow, colorShift }`) with the equipped shoe if the shop should remember them.
- If **pre-generation or re-forge**: `ShoeGenerationRequest` (and backend) would need to accept something like `modifiers?: { material?: string; sole?: string; glow?: boolean; colorOverride?: string }` and return a result that reflects them (e.g. different asset or same asset with metadata for client-side application).

---

## How it fits the current flow

- **Current P0 flow:** prompt + style → Forge → processing → reveal → Equip. No modifier step.
- **Adding modifiers (later):** Either (a) add an optional “Customize” step on reveal that only affects preview/metadata, or (b) add modifier chips/controls before Forge and extend the generation request. In both cases, equip payload (e.g. `shoeResult` + optional `modifiers`) would need to be defined so the shop can persist and apply them when rendering the avatar.
