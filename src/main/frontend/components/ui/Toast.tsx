import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, default 4000
}

// Global singleton store
let toastSetter: ((fn: (prev: ToastItem[]) => ToastItem[]) => void) | null = null;

export function toast(item: Omit<ToastItem, 'id'>) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  toastSetter?.((prev) => [...prev, { ...item, id }]);
}

// Convenience helpers
toast.success = (title: string, message?: string) =>
  toast({ type: 'success', title, message });
toast.error = (title: string, message?: string) =>
  toast({ type: 'error', title, message });
toast.warning = (title: string, message?: string) =>
  toast({ type: 'warning', title, message });
toast.info = (title: string, message?: string) =>
  toast({ type: 'info', title, message });

const CONFIGS: Record<ToastType, { icon: typeof CheckCircle2; bg: string; border: string; iconColor: string; titleColor: string }> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-white',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-800',
  },
  error: {
    icon: XCircle,
    bg: 'bg-white',
    border: 'border-red-200',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-white',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-800',
  },
  info: {
    icon: Info,
    bg: 'bg-white',
    border: 'border-blue-200',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
  },
};

function ToastItemView({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const cfg = CONFIGS[item.type];
  const Icon = cfg.icon;
  const duration = item.duration ?? 4000;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), duration);
    return () => clearTimeout(timer);
  }, [item.id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`flex w-full max-w-sm items-start gap-3 rounded-xl border shadow-lg ${cfg.bg} ${cfg.border} px-4 py-3`}
      role="alert"
      aria-live="polite"
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${cfg.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold ${cfg.titleColor}`}>{item.title}</p>
        {item.message && (
          <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">{item.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Tutup notifikasi"
        className="ml-1 shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);

  // Register the setter so the singleton toast() function can add items
  toastSetter = setItems;

  const dismiss = (id: string) => setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <div
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-label="Notifikasi"
    >
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastItemView item={item} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
