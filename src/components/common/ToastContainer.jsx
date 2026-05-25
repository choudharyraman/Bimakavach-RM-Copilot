import { useApp } from '../../context/AppContext';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const toastIcons = {
  success: CheckCircle,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

const toastColors = {
  success: 'var(--success)',
  error: 'var(--danger)',
  warning: 'var(--warning)',
  info: 'var(--brand-primary)',
};

export default function ToastContainer() {
  const { state, dispatch } = useApp();

  if (state.toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--space-6)',
        right: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        zIndex: 'var(--z-toast)',
      }}
    >
      {state.toasts.map((toast) => {
        const Icon = toastIcons[toast.type] || Info;
        return (
          <div
            key={toast.id}
            className="toast"
            style={{
              borderLeft: `3px solid ${toastColors[toast.type] || toastColors.info}`,
            }}
          >
            <Icon size={18} color={toastColors[toast.type]} />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', flex: 1 }}>
              {toast.message}
            </span>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
              }}
              onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
