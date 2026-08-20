import { Link } from 'react-router';

interface BrandMarkProps {
  inverted?: boolean;
  className?: string;
}

export function BrandMark({ inverted = false, className = '' }: BrandMarkProps) {
  return (
    <Link to="/" className={`inline-flex items-center group shrink-0 ${className}`} aria-label="dicukur.in">
      <img
        src="/images/dicukur.in.png"
        alt="dicukur.in Logo"
        width={140}
        height={36}
        style={{ maxHeight: '36px', maxWidth: '140px', width: 'auto', height: '36px', objectFit: 'contain' }}
        className={`h-9 max-h-9 w-auto max-w-[140px] shrink-0 object-contain transition-transform group-hover:scale-105 ${inverted ? 'brightness-0 invert' : ''}`}
      />
    </Link>
  );
}



