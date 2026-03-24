export type { Phase } from '../constants/phases';
export type { ShoeGenerationResult } from '../engine/types';

export interface ShoeConfig {
  style: string | null;
  prompt: string | null;
}

export interface AvatarPayload {
  avatarImageUrl: string;
  avatarId?: string;
  avatarConfig?: unknown;
  coinBalance?: number;
}

export type ShoeGenMessage =
  | { type: 'shoegen:ready' }
  | { type: 'shoegen:equipped'; payload: { shoeConfig: ShoeConfig; shoeResult?: unknown } }
  | { type: 'shoegen:save'; payload: { shoeConfig: ShoeConfig; shoeResult?: unknown } }
  | { type: 'shoegen:phase-change'; payload: { phase: string } }
  | { type: 'shoegen:close' }
  | { type: 'shoegen:spend-coins'; payload: { amount: number; reason?: string } };

export type ParentMessage =
  | { type: 'qbit:avatar-data'; payload: AvatarPayload }
  | { type: 'qbit:request-close' }
  | { type: 'qbit:coin-balance'; payload: { coinBalance: number } };
