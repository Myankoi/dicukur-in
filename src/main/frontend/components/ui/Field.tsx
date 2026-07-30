import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FieldFrameProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

function FieldFrame({ label, htmlFor, hint, error, children }: FieldFrameProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-xs font-semibold text-zinc-300">
          {label}
        </label>
        {hint && <span className="text-[11px] text-zinc-600">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const controlStyles =
  'w-full rounded-md border border-zinc-700 bg-zinc-950/70 px-3.5 text-sm text-zinc-100 ' +
  'placeholder:text-zinc-600 transition-colors hover:border-zinc-600 focus:border-brand-400 focus:outline-none';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function InputField({ label, error, hint, id, className = '', ...props }: InputFieldProps) {
  const inputId = id ?? props.name;

  if (!inputId) {
    throw new Error('InputField requires an id or name');
  }

  return (
    <FieldFrame label={label} htmlFor={inputId} hint={hint} error={error}>
      <input
        id={inputId}
        className={`${controlStyles} h-11 ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </FieldFrame>
  );
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextareaField({ label, error, hint, id, className = '', ...props }: TextareaFieldProps) {
  const inputId = id ?? props.name;

  if (!inputId) {
    throw new Error('TextareaField requires an id or name');
  }

  return (
    <FieldFrame label={label} htmlFor={inputId} hint={hint} error={error}>
      <textarea
        id={inputId}
        className={`${controlStyles} min-h-24 resize-y py-3 ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </FieldFrame>
  );
}
