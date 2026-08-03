import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const base =
  'group relative isolate inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-md font-semibold ' +
  'transition-[border-color,background-color,color,box-shadow,transform] duration-300 ' +
  'before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:-z-10 before:h-0 before:bg-zinc-950/12 ' +
  'before:transition-[height] before:duration-300 before:ease-out hover:before:h-full ' +
  'hover:-translate-y-0.5 active:translate-y-0 [&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-out ' +
  'hover:[&_svg]:translate-x-1 hover:[&_svg]:-translate-y-0.5 hover:[&_svg]:rotate-[-18deg] active:[&_svg]:translate-x-0 ' +
  'disabled:pointer-events-none disabled:opacity-50 disabled:before:h-0';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-400 text-zinc-950 shadow-[0_14px_30px_rgba(216,174,79,0.16)] hover:bg-brand-300 hover:shadow-[0_18px_38px_rgba(216,174,79,0.24)]',
  secondary: 'border border-zinc-700 bg-transparent text-zinc-100 before:bg-brand-400 hover:border-brand-400 hover:text-zinc-950 hover:shadow-[0_14px_30px_rgba(216,174,79,0.10)]',
  ghost: 'text-zinc-400 before:bg-zinc-900 hover:text-zinc-100',
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
