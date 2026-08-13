import { Scissors } from 'lucide-react';
import { Link } from 'react-router';

interface BrandMarkProps {
  inverted?: boolean;
}

export function BrandMark({ inverted = false }: BrandMarkProps) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5 group" aria-label="dicukur.in">
      <span className="grid size-8 place-items-center rounded-lg bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
        <Scissors size={17} />
      </span>
      <span className={`font-display text-xl font-bold tracking-tight ${inverted ? 'text-white' : 'text-slate-900'}`}>
        dicukur<span className="text-blue-600">.in</span>
      </span>
    </Link>
  );
}
