import { Link } from 'react-router';

interface BrandMarkProps {
  inverted?: boolean;
  compact?: boolean;
}

export function BrandMark({ inverted = false, compact = false }: BrandMarkProps) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5" aria-label="dicukur.in">
      <span className={`font-display text-xl font-bold tracking-tight ${inverted ? 'text-white' : 'text-slate-900'}`}>
        dicukur<span className="text-red-600">.</span><span className="text-blue-600">in</span>
      </span>
    </Link>
  );
}

