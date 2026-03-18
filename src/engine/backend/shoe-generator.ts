import type { ShoeGenerationRequest, ShoeGenerationResult } from '../types';

const FALLBACK_RESULT: ShoeGenerationResult = {
  previewImageUrl: null,
  shoeName: 'Mystery Kicks',
  shoePrompt: 'default fallback shoe',
  metadata: { source: 'fallback' },
};

function toTitleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function buildTwoWordShoeName(prompt: string): string {
  const promptWords = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3);

  const first = promptWords[0] ?? 'Mystery';
  const second = promptWords[1] ?? 'Kicks';
  return `${toTitleCase(first)} ${toTitleCase(second)}`;
}

export async function generateShoe(
  request: ShoeGenerationRequest,
  _apiKey?: string,
  signal?: AbortSignal,
): Promise<{ result: ShoeGenerationResult; source: 'ai' | 'fallback'; error?: string }> {
  // TODO: Wire up the real shoe generation backend here.
  // For now, return a structured fallback so the UI flow works end-to-end.

  if (signal?.aborted) {
    return { result: FALLBACK_RESULT, source: 'fallback', error: 'Aborted' };
  }

  try {
    // Placeholder for real API call:
    // const response = await fetch(SHOE_API_URL, { method: 'POST', body: JSON.stringify(request), signal });
    // const data = await response.json();
    // return { result: adaptShoeResponse(data), source: 'ai' };

    return {
      result: {
        previewImageUrl: null,
        shoeName: buildTwoWordShoeName(request.prompt),
        shoePrompt: request.prompt,
        metadata: { source: 'fallback', style: request.style },
      },
      source: 'fallback',
      error: 'Backend not connected yet',
    };
  } catch (err) {
    return {
      result: { ...FALLBACK_RESULT, shoePrompt: request.prompt },
      source: 'fallback',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export { FALLBACK_RESULT };
