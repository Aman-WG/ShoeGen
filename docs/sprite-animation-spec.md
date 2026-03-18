# Shoe Generator — Sprite Animation Spec

Brief for artists and integration notes for dev. Sprites drive the steam-press and reveal moments in the Shoe Generator experience.

---

## Moments and intent

| Moment | Intent | When it runs |
|--------|--------|----------------|
| **Intro / idle** | Robotic steam press in center; top and bottom parts **separate (open state)**. | Shown when user sees the bottom dialog (IDLE or PROMPT phase). |
| **After Forge (processing)** | Steam press **closes**; screen shake + on-screen animation while AI generates. | From Forge click until generation finishes (~10s). |
| **Reveal** | Gacha-style **grand reveal** of the shoe (e.g. press opening, light burst, then shoe appears). | When phase switches to REVEAL; ShoeReveal already has windmill/rays/sparkles. |

---

## Format and specs

- **Format:** Sprite sheets (PNG) with a regular grid. The app animates by changing `background-position` (same pattern as legacy ScannerScreen/RoboArm).
- **Suggested specs to define with art:**
  - **Steam press (open):** One sheet or two (top half / bottom half). Grid e.g. 4×2 or 5×2 per half; frame size in px (e.g. 320×180 per cell).
  - **Steam press (closing / closed):** Either part of the same sheet (open → closed → open) or a second sheet. If one sheet: e.g. 6×3 grid (open frames, closing, closed, opening for reveal).
  - **Reveal moment (optional):** Small sheet for “chest open” / light burst (e.g. 4×2) that plays before the shoe appears in ShoeReveal.
- **File names (suggested):**
  - `steam-press-open.png` (idle open state)
  - `steam-press-processing.png` (closing + closed + steam/sparks overlay, or combined)
  - `reveal-burst.png` (optional)

---

## Integration (dev)

- **Components:** New React component(s) in `src/components/Stage/` (e.g. `SteamPress.tsx`). They receive `phase` and optional `isLooping` / `fireTrigger` and render a `div` with `background-image` + `background-position` driven by state/frame index.
- **CSS:** Classes in `src/styles/shoe-workshop.css` for positioning and sprite grid (e.g. `background-size: 500% 200%` for 5×2).
- **Wiring:** [Stage.tsx](src/components/Stage/Stage.tsx) and [Layout.tsx](src/components/Layout.tsx) pass phase (and any trigger) so open/close and reveal moments match the flow. No modifier logic required for P0.
