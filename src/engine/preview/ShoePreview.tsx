import type { ShoeGenerationResult } from '../types';

interface ShoePreviewProps {
  result: ShoeGenerationResult | null;
  className?: string;
}

function toTwoWordName(name?: string): string {
  const words = (name ?? 'Mystery Kicks')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (words.length === 0) return 'Mystery Kicks';
  if (words.length === 1) return `${words[0]} Kicks`;
  return `${words[0]} ${words[1]}`;
}

/**
 * Placeholder preview component for generated shoes.
 * Will be replaced with a real renderer once the backend produces image URLs.
 */
export function ShoePreview({ result, className }: ShoePreviewProps) {
  if (!result) return null;
  const displayName = toTwoWordName(result.shoeName);

  return (
    <div className={`shoe-preview ${className ?? ''}`}>
      {result.previewImageUrl ? (
        <img
          src={result.previewImageUrl}
          alt={displayName}
          className="shoe-preview__image"
          draggable={false}
        />
      ) : (
        <div className="shoe-preview__placeholder">
          <span className="shoe-preview__placeholder-icon">👟</span>
          <span className="shoe-preview__placeholder-name">
            {displayName}
          </span>
        </div>
      )}
    </div>
  );
}
