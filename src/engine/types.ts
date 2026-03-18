export interface ShoeGenerationResult {
  previewImageUrl: string | null;
  shoeName?: string;
  shoePrompt: string;
  appliedItemId?: string;
  metadata?: Record<string, unknown>;
}

export interface ShoeGenerationRequest {
  prompt: string;
  avatarId?: string;
  style?: string;
}

export interface ShoeModifiers {
  material: string | null;
  sole: string | null;
  laces: string | null;
  glow: boolean;
  colorOverride: string | null;
}
