import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  HelpCircle,
  X,
  ShieldAlert,
} from "lucide-react";

const typeStyles = {
  confirm: {
    icon: HelpCircle,
    iconClass:
      "from-blue-500/15 to-indigo-500/15 text-blue-600 dark:text-blue-400",
    glowClass: "bg-blue-500/10",
    buttonClass:
      "bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 hover:from-slate-700 hover:via-slate-800 hover:to-slate-900 shadow-[0_8px_22px_rgba(15,23,42,0.22)]",
  },

  warning: {
    icon: AlertTriangle,
    iconClass:
      "from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400",
    glowClass: "bg-amber-500/10",
    buttonClass:
      "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-[0_8px_22px_rgba(245,158,11,0.24)]",
  },

  error: {
    icon: CircleAlert,
    iconClass:
      "from-red-500/15 to-rose-500/15 text-red-600 dark:text-red-400",
    glowClass: "bg-red-500/10",
    buttonClass:
      "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-[0_8px_22px_rgba(239,68,68,0.24)]",
  },

  success: {
    icon: CheckCircle2,
    iconClass:
      "from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400",
    glowClass: "bg-emerald-500/10",
    buttonClass:
      "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-[0_8px_22px_rgba(16,185,129,0.24)]",
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

  const styles =
    typeStyles[type] || typeStyles.confirm;

  const Icon = styles.icon;

  const buttonClass = destructive
    ? `
      bg-gradient-to-r
      from-red-500
      via-rose-600
      to-red-700
      hover:from-red-600
      hover:via-rose-700
      hover:to-red-800
      shadow-[0_8px_24px_rgba(239,68,68,0.28)]
    `
    : styles.buttonClass;

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        p-4
        bg-slate-950/60
        dark:bg-black/70
        backdrop-blur-md
        animate-in
        fade-in
        duration-200
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-dialog-title"
    >
      {/* Background glow */}
      <div
        className="
          pointer-events-none
          absolute
          w-[420px]
          h-[420px]
          rounded-full
          bg-blue-500/10
          dark:bg-blue-500/5
          blur-[100px]
        "
      />

      {/* Dialog */}
      <div
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-[28px]
          bg-white/95
          dark:bg-slate-950/95
          backdrop-blur-2xl
          border
          border-white/80
          dark:border-white/10
          shadow-[0_30px_100px_rgba(15,23,42,0.25)]
          dark:shadow-[0_30px_100px_rgba(0,0,0,0.55)]
          animate-in
          zoom-in-95
          slide-in-from-bottom-3
          duration-300
        "
      >
        {/* Decorative top gradient */}
        <div
          className="
            absolute
            inset-x-0
            top-0
            h-1
            bg-gradient-to-r
            from-blue-500
            via-violet-500
            to-cyan-500
          "
        />

        {/* Decorative glow */}
        <div
          className={`
            pointer-events-none
            absolute
            -top-16
            -right-16
            w-40
            h-40
            rounded-full
            blur-3xl
            ${styles.glowClass}
          `}
        />

        {/* Close button */}
        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="
              absolute
              top-4
              right-4
              z-20
              w-9
              h-9
              rounded-xl
              grid
              place-items-center
              text-slate-400
              dark:text-slate-500
              hover:text-slate-700
              dark:hover:text-white
              hover:bg-slate-100
              dark:hover:bg-slate-800
              transition-all
              duration-200
              hover:rotate-90
            "
          >
            <X size={17} />
          </button>
        )}

        {/* Main Content */}
        <div className="relative p-6 sm:p-7">

          <div className="flex items-start gap-4">

            {/* Icon */}
            <div
              className={`
                relative
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                ${styles.iconClass}
                border
                border-white/70
                dark:border-white/10
                shadow-[0_8px_25px_rgba(15,23,42,0.08)]
              `}
            >
              <div
                className="
                  absolute
                  inset-0
                  rounded-2xl
                  bg-white/20
                  dark:bg-white/5
                "
              />

              <Icon
                size={25}
                strokeWidth={2.2}
                className="relative"
              />

              {destructive && (
                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    w-5
                    h-5
                    rounded-full
                    bg-red-500
                    text-white
                    grid
                    place-items-center
                    border-2
                    border-white
                    dark:border-slate-950
                  "
                >
                  <ShieldAlert size={10} />
                </span>
              )}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1 pr-5">

              <h2
                id="app-dialog-title"
                className="
                  text-lg
                  sm:text-xl
                  font-extrabold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                "
              >
                {title}
              </h2>

              <p
                className="
                  mt-2.5
                  whitespace-pre-line
                  text-sm
                  leading-6
                  text-slate-600
                  dark:text-slate-400
                "
              >
                {message}
              </p>

            </div>

          </div>
        </div>

        {/* Actions */}
        <div
          className="
            relative
            flex
            flex-col-reverse
            sm:flex-row
            sm:justify-end
            gap-2.5
            border-t
            border-slate-100
            dark:border-slate-800
            bg-slate-50/70
            dark:bg-slate-900/50
            px-6
            py-4
          "
        >

          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="
                group
                relative
                overflow-hidden
                rounded-xl
                border
                border-slate-200
                dark:border-slate-700
                bg-white
                dark:bg-slate-900
                px-5
                py-2.5
                text-sm
                font-semibold
                text-slate-700
                dark:text-slate-300
                shadow-sm
                hover:bg-slate-50
                dark:hover:bg-slate-800
                hover:border-slate-300
                dark:hover:border-slate-600
                hover:shadow-md
                transition-all
                duration-200
                active:scale-[0.98]
              "
            >
              <span className="relative">
                {cancelText}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm || onCancel}
            className={`
              group
              relative
              overflow-hidden
              rounded-xl
              px-5
              py-2.5
              text-sm
              font-bold
              text-white
              transition-all
              duration-200
              active:scale-[0.98]
              hover:-translate-y-0.5
              ${buttonClass}
            `}
          >
            {/* Button shine */}
            <span
              className="
                absolute
                inset-0
                bg-gradient-to-r
                from-transparent
                via-white/15
                to-transparent
                -translate-x-full
                group-hover:translate-x-full
                transition-transform
                duration-700
              "
            />

            <span className="relative flex items-center justify-center gap-2">
              {destructive ? (
                <ShieldAlert size={15} />
              ) : type === "success" ? (
                <CheckCircle2 size={15} />
              ) : (
                <CheckCircle2 size={15} />
              )}

              {confirmText}
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}