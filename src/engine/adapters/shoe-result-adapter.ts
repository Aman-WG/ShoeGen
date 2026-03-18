import type { ShoeGenerationResult } from '../types';

/**
 * Converts a raw backend response into the clean ShoeGenerationResult
 * the UI layer expects. Prevents raw API shapes from leaking into components.
 */
export function adaptShoeResponse(raw: Record<string, unknown>): ShoeGenerationResult {
  return {
    previewImageUrl: typeof raw.image_url === 'string' ? raw.image_url : null,
    shoeName: typeof raw.name === 'string' ? raw.name : undefined,
    shoePrompt: typeof raw.prompt === 'string' ? raw.prompt : '',
    appliedItemId: typeof raw.item_id === 'string' ? raw.item_id : undefined,
    metadata: typeof raw.metadata === 'object' && raw.metadata !== null
      ? (raw.metadata as Record<string, unknown>)
      : undefined,
  };
}
