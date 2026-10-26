import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-xl border flex items-start gap-3 transition-all animate-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-[#15803d] text-white border-[#166534]'
                : isWarning
                ? 'bg-[#b45309] text-white border-[#92400e]'
                : isError
                ? 'bg-red-700 text-white border-red-800'
                : 'bg-[#593c28] text-white border-[#432d1e]'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-300" />}
            {isWarning && <AlertTriangle className="w-5 h-5 shrink-0 text-amber-300" />}
            {isError && <AlertCircle className="w-5 h-5 shrink-0 text-red-300" />}
            {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 shrink-0 text-[#dac7b5]" />}

            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-white/80 hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
