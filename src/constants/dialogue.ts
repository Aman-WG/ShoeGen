import { PHASE, type Phase } from './phases';

export interface DialogueLine {
  text: string;
  delay?: number;
}

export const DIALOGUE: Record<Phase, DialogueLine[]> = {
  [PHASE.IDLE]: [
    { text: 'Q-BIT scan complete. Shoe game: LACKING.', delay: 0 },
    { text: "Firing up the forge. Describe the kicks you want.", delay: 700 },
  ],

  [PHASE.PROMPT]: [
    { text: 'Describe the kicks you want. Go crazy.', delay: 0 },
  ],

  [PHASE.PROCESSING]: [
    { text: 'Forging your kicks...', delay: 0 },
  ],

  [PHASE.REVEAL]: [],
};

export const PROCESSING_LINES = [
  'Heating up the sole press...',
  'Stitching pixels at lightspeed...',
  'Downloading drip from the cloud...',
  'Consulting the sneaker oracle...',
  'Injecting hype into the midsole...',
  'Calibrating the lace tension...',
  'Mixing colorways in zero gravity...',
  'Rendering pure swag into leather...',
  'Pressurizing the air bubble...',
  'Overclocking the style engine...',
  'Feeding your prompt to the forge gods...',
  'Laser-cutting the toe box...',
  'Borrowing materials from a parallel dimension...',
  'Running it through the drip filter...',
  'Assembling sneaker DNA...',
  'Compressing a supernova into the outsole...',
  'Teaching rubber how to vibe...',
  'Forging laces from pure energy...',
  'Channeling main character energy into the heel...',
  'Melting crayons at lightspeed...',
  'Spinning up the glow reactor...',
  'Your kicks are almost sentient...',
  'Bottling lightning for the midsole...',
  'Folding spacetime for maximum drip...',
  'Final stitching... almost there...',
];
