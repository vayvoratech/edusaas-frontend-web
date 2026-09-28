import React from "react";

const typeStyles = {
  confirm: {
    icon: "?",
    iconClass: "bg-amber-100 text-amber-700",
    buttonClass: "bg-slate-900 hover:bg-slate-800",
  },
  warning: {
    icon: "!",
    iconClass: "bg-amber-100 text-amber-700",
    buttonClass: "bg-amber-600 hover:bg-amber-700",
  },
  error: {
    icon: "!",
    iconClass: "bg-red-100 text-red-700",
    buttonClass: "bg-red-600 hover:bg-red-700",
  },
  success: {
    icon: "?",
    iconClass: "bg-green-100 text-green-700",
    buttonClass: "bg-green-600 hover:bg-green-700",
  },
};

export default function AppDialog({
  open,
  type = "confirm",
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  showCancel = true,
  destructive = false,
}) {
  if (!open) return null;

  const styles = typeStyles[type] || typeStyles.confirm;

  const buttonClass = destructive
    ? "bg-red-600 hover:bg-red-700"
    : styles.buttonClass;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-dialog-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${styles.iconClass}`}
            >
              {styles.icon}
            </div>

            <div className="min-w-0 flex-1">
              <h2
                id="app-dialog-title"
                className="text-lg font-semibold text-slate-900"
              >
                {title}
              </h2>

              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm || onCancel}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${buttonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}


