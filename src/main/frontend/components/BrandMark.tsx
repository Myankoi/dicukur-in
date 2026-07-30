import { Link } from 'react-router';

interface BrandMarkProps {
  inverted?: boolean;
  compact?: boolean;
}

export function BrandMark({ inverted = true, compact = false }: BrandMarkProps) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5" aria-label="dicukur.in">
      <span className="grid size-8 place-items-center rounded-full bg-brand-400 font-display text-lg font-bold text-zinc-950 shadow-[0_0_20px_rgba(216,174,79,0.22)]">
        d
      </span>
      {!compact && (
        <span className={`font-display text-xl font-semibold ${inverted ? 'text-zinc-100' : 'text-zinc-950'}`}>
          dicukur.in
        </span>
      )}
    </Link>
  );
}
