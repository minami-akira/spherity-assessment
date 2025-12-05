interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: '🗑️',
      iconBg: 'bg-red-500/10',
      confirmBtn: 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/25 hover:shadow-red-500/40',
    },
    warning: {
      icon: '⚠️',
      iconBg: 'bg-amber-500/10',
      confirmBtn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25 hover:shadow-amber-500/40',
    },
    info: {
      icon: 'ℹ️',
      iconBg: 'bg-primary-500/10',
      confirmBtn: 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-600/25 hover:shadow-primary-500/40',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/50 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          {/* Icon */}
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${styles.iconBg} flex items-center justify-center`}>
            <span className="text-3xl">{styles.icon}</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-slate-100 mb-2">{title}</h3>

          {/* Message */}
          <p className="text-slate-400 mb-6">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-all duration-200 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 ${styles.confirmBtn}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

