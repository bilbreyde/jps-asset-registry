import React from 'react';

const ICONS = {
  success: (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="7"/>
      <path d="M5.5 8.5l2.2 2.2 4-4"/>
    </svg>
  ),
  error: (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="7"/>
      <path d="M6 6l5 5M11 6l-5 5"/>
    </svg>
  ),
  info: (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="7"/>
      <path d="M8.5 7.5v4M8.5 5.5v.5"/>
    </svg>
  ),
};

function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-region" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type} ${t.exiting ? 'toast-exit' : 'toast-enter'}`}>
          <span className="toast-icon">{ICONS[t.type] ?? ICONS.info}</span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-dismiss" onClick={() => onDismiss(t.id)} aria-label="Dismiss notification">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M1 1l11 11M12 1L1 12"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;
