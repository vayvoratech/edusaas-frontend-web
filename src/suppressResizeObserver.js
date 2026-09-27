// Suppress benign ResizeObserver errors caused by Monaco Editor / resizable panels
if (typeof window !== 'undefined') {
  const isResizeObserverError = (err) => {
    const msg = typeof err === 'string' ? err : err?.message;
    return (
      msg &&
      (msg.includes('ResizeObserver loop completed with undelivered notifications') ||
       msg.includes('ResizeObserver loop limit exceeded'))
    );
  };

  window.addEventListener(
    'error',
    (e) => {
      if (isResizeObserverError(e.error) || isResizeObserverError(e.message)) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (e) => {
      if (isResizeObserverError(e.reason)) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true
  );
}
