import React from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-70 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 rounded-lg border shadow-lg text-xs flex items-start justify-between gap-3 transition-all ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-emerald-500'
              : toast.type === 'warning'
              ? 'bg-slate-900 text-white border-amber-500'
              : toast.type === 'error'
              ? 'bg-slate-900 text-white border-red-500'
              : 'bg-slate-900 text-white border-blue-500'
          }`}
        >
          <div className="space-y-0.5">
            <div className="font-bold flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  toast.type === 'success'
                    ? 'bg-emerald-400'
                    : toast.type === 'warning'
                    ? 'bg-amber-400'
                    : toast.type === 'error'
                    ? 'bg-red-400'
                    : 'bg-blue-400'
                }`}
              />
              <span>{toast.title}</span>
            </div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              {toast.message}
            </div>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-0.5 font-mono text-xs shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
