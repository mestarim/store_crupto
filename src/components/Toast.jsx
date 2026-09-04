import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toast } = useStore();

  if (!toast) return null;

  return (
    <div className="toast-container" dir="rtl">
      <div className={`toast toast-${toast.type || 'success'}`}>
        {toast.type === 'error' ? (
          <AlertCircle size={20} color="#ef4444" />
        ) : toast.type === 'info' ? (
          <Info size={20} color="#6366f1" />
        ) : (
          <CheckCircle2 size={20} color="#10b981" />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
