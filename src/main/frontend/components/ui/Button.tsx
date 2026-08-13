import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 ' +
  'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/25 border border-blue-600',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
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
