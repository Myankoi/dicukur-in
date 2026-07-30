import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold transition-colors ' +
  'disabled:pointer-events-none disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-400 text-zinc-950 hover:bg-brand-300',
  secondary: 'border border-zinc-700 bg-transparent text-zinc-100 hover:border-brand-400 hover:text-brand-300',
  ghost: 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-sm',
};

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className = '',
}: ButtonStyleOptions = {}) {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(' ');
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleOptions {
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  );
}
