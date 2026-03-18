import { PHASE, type Phase } from './phases';

export interface DialogueLine {
  text: string;
  delay?: number;
}

export const DIALOGUE: Record<Phase, DialogueLine[]> = {
  [PHASE.IDLE]: [
    { text: 'Q-BIT scan complete. Shoe game: LACKING.', delay: 0 },
    { text: "Time to craft some heat. Hit the button.", delay: 700 },
  ],

  [PHASE.PROMPT]: [
    { text: 'Describe the kicks you want. Go crazy.', delay: 0 },
  ],

  [PHASE.PROCESSING]: [
    { text: 'Forging your kicks...', delay: 0 },
  ],

  [PHASE.REVEAL]: [],
};
