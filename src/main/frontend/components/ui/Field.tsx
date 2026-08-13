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
        <label htmlFor={htmlFor} className="text-xs font-bold text-slate-700">
          {label}
        </label>
        {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

const controlStyles =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-red-600 focus:outline-none';

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
